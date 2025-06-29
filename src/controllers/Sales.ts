import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Sale, { ISalePayment, ISaleProduct } from '../models/SalesPayment';
import Customer from '../models/Customer';
import StoreProduct from '../models/StoreProduct';
import { CreateResponse } from '../util/response';


interface KPIQuery {
  filter?: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  from?: string;
  to?: string;
  store_id?: string;
}

const getDateRangeNew = (
  filter: string,
  from?: string,
  to?: string
): { start: Date; end: Date } => {
  const now = new Date();

  switch (filter) {
    case 'today': {
      const start = new Date(now.setHours(0, 0, 0, 0));
      const end = new Date(now.setHours(23, 59, 59, 999));
      return { start, end };
    }
    case 'yesterday': {
      const yest = new Date();
      yest.setDate(now.getDate() - 1);
      const start = new Date(yest.setHours(0, 0, 0, 0));
      const end = new Date(yest.setHours(23, 59, 59, 999));
      return { start, end };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'custom': {
      if (!from || !to) {
        throw new Error('`from` and `to` are required for custom filter');
      }
      return { start: new Date(from), end: new Date(to) };
    }
    default:
      throw new Error('Invalid filter value');
  }
};

export const SalesKPI = async (
  req: Request<{}, {}, {}, KPIQuery>,
  res: Response
): Promise<any> => {
  try {
    const { filter = 'today', from, to, store_id } = req.query;

    console.log("Hitted", filter, from, to, store_id);
    

    if (!store_id) {
      return res.json(CreateResponse(false, null, 'Store ID is required.'));
    }

    let startDate: Date;
    let endDate: Date;

    try {
      ({ start: startDate, end: endDate } = getDateRangeNew(filter, from, to));
    } catch (err: any) {
      return res.json(CreateResponse(false, null, err.message));
    }

    const [data] = await Sale.aggregate([
      {
        $match: {
          store_id: new Types.ObjectId(store_id),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total_amount' },
          totalPayments: { $sum: '$total_paid' },
        },
      },
    ]);

    const kpis = data ?? { totalSales: 0, totalPayments: 0 };

    return res.status(200).json(CreateResponse(true, kpis));
  } catch (error) {
    console.error('[SalesKPI] Error:', error);
    return res
      .status(500)
      .json(CreateResponse(false, null, 'Failed to fetch sales KPIs'));
  }
};

export const createNewSale = async (req: Request, res: Response): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            customer,
            store_id,
            servedBy,
            products,
            payments,
            discount = 0,
        }: {
            customer: {
                name: string;
                phone: string;
                region: string;
                street?: string;
                district?: string;
                ward?: string;
            };
            store_id: string;
            servedBy: string;
            products: ISaleProduct[];
            payments: ISalePayment[];
            discount?: number; // Optional discount field
        } = req.body;

        if (!store_id || !servedBy || !products?.length || !payments?.length) {
            throw new Error('Missing required sale data.');
        }

        // Step 1: Check or create customer
        let customerDoc = await Customer.findOne({ phone: customer.phone }).session(session);

        if (!customerDoc) {
            const created = await Customer.create(
                [
                    {
                        name: customer.name,
                        phone: customer.phone,
                        region: customer.region,
                        district: customer.district,
                        ward: customer.ward,
                        street: customer.street, // village
                        servedBy,
                    },
                ],
                { session }
            );
            customerDoc = created[0];
        }

        // Step 2: Calculate totals
        const total_amount: number = products.reduce(
            (sum: number, p) => sum + p.price * p.quantity,
            0
        );
        const total_paid: number = payments.reduce((sum: number, p) => sum + p.amount, 0);
        const payment_status: 'paid' | 'partial' | 'unpaid' =
            total_paid >= total_amount ? 'paid' : total_paid > 0 ? 'partial' : 'unpaid';

        // Step 3: Create the sale
        const saleDoc = await Sale.create(
            [
                {
                    customer_id: customerDoc._id,
                    store_id,
                    servedBy,
                    products,
                    payments,
                    total_amount,
                    total_paid,
                    payment_status,
                    discount: discount, // Optional discount field
                },
            ],
            { session }
        );



        for (const item of products) {
            const { product_id, quantity } = item;

            const storeStock = await StoreProduct.findOne({
                store_id,
                product_id,
            }).session(session);



            if (!storeStock || storeStock.quantity < quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.json(
                    CreateResponse(
                        false,
                        null,
                        `Insufficient stock for product ${product_id}. Available: ${storeStock?.quantity || 0}`
                    )
                );
            }


            // Deduct stock
            storeStock.quantity -= quantity;
            await storeStock.save({ session });
        }

        await session.commitTransaction();
        session.endSession();



        return res
            .json(CreateResponse(true, saleDoc[0], 'Sale created successfully.'));
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error('[createNewSale]', error);
        return res.status(500).json(CreateResponse(false, null, error.message || 'Failed to create sale.'));
    }
};




interface QueryParams {
    filter?: 'today' | 'yesterday' | 'custom' | 'week' | 'month';
    from?: string;
    to?: string;
    store_id?: string;
    role?: 'admin' | 'sales' | 'accountant';
    page?: string;
    limit?: string;
}
const getDateRange = (
  filter: string,
  from?: string,
  to?: string
): { start: Date; end: Date } => {
  const now = new Date();

  switch (filter) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'yesterday': {
      const yest = new Date(now);
      yest.setDate(now.getDate() - 1);
      yest.setHours(0, 0, 0, 0);
      const end = new Date(yest);
      end.setHours(23, 59, 59, 999);
      return { start: yest, end };
    }
    case 'week': {
      const start = new Date(now);
      const day = start.getDay(); // Sunday = 0
      start.setDate(start.getDate() - day); // adjust to previous Sunday
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'custom': {
      if (!from || !to) {
        throw new Error('`from` and `to` dates required');
      }
      return {
        start: new Date(from),
        end: new Date(to),
      };
    }
    default:
      throw new Error('Invalid `filter` value');
  }
};


export const dailySalesReport = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
): Promise<any> => {
    try {
        const {
            filter = 'today',
            from,
            to,
            store_id,
            role,
            page = '1',
            limit = '10',
        } = req.query;

        // ⏱️ Date range
        let startDate: Date;
        let endDate: Date;

        try {
            const { start, end } = getDateRange(filter, from, to);
            startDate = start;
            endDate = end;
        } catch (err: any) {
            return res
                .status(400)
                .json(CreateResponse(false, null, err.message || 'Invalid date range'));
        }

        // 🏪 Store access control
        const storeFilter: Record<string, unknown> = {};
        if (store_id === 'all') {
            if (role !== 'admin') {
                return res
                    .status(403)
                    .json(CreateResponse(false, null, 'Only admin can view all stores'));
            }
        } else if (store_id) {
            storeFilter.store_id = new Types.ObjectId(store_id);
        }

        // 📄 Pagination logic
        const currentPage = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (currentPage - 1) * pageSize;

        // 🧠 Aggregation
        const results = await Sale.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    ...storeFilter,
                },
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'customer',
                },
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'servedBy',
                    foreignField: '_id',
                    as: 'servedBy',
                },
            },
            { $unwind: '$servedBy' },
            {
                $lookup: {
                    from: 'stores',
                    localField: 'store_id',
                    foreignField: '_id',
                    as: 'store',
                },
            },
            { $unwind: '$store' },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product_id',
                    foreignField: '_id',
                    as: 'product_details',
                },
            },
            { $unwind: '$product_details' },
            {
                $group: {
                    _id: '$_id',
                    createdAt: { $first: '$createdAt' },
                    customer: { $first: '$customer' },
                    servedBy: {
                        $first: {
                            $concat: [
                                { $ifNull: ['$servedBy.fname', ''] },
                                ' ',
                                { $ifNull: ['$servedBy.lname', ''] },
                            ],
                        },
                    },
                    store: { $first: '$store.name' },
                    products: {
                        $push: {
                            name: '$product_details.name',
                            category: '$product_details.category',
                            quantity: '$products.quantity',
                            price: '$products.price',
                            serial_number: '$products.serial_number',
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: pageSize }],
                    totalCount: [{ $count: 'count' }],
                },
            },
        ]);

        const sales = results[0]?.paginatedResults || [];
        const total = results[0]?.totalCount[0]?.count || 0;

        return res.status(200).json(
            CreateResponse(true, {
                total,
                currentPage,
                totalPages: Math.ceil(total / pageSize),
                pageSize,
                data: sales,
            })
        );
    } catch (error) {
        console.error('[dailySalesReport] Error:', error);
        return res
            .json(CreateResponse(false, null, 'Failed to fetch sales report'));
    }
};