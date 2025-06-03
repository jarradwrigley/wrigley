import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { options } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

// interface CartItem {
//   id: string;
//   title: string;
//   price: number;
//   quantity: number;
//   image: string;
// }

// interface Address {
//   city: string;
//   coordinates: [number, number];
//   country: string;
//   fullAddress: string;
//   state: string;
//   zip: string;
// }

// interface PaymentDetails {
//   cardHolder: string;
//   cardNumber: string; // You might want to mask this in production
//   cvv: string; // Don't store this in production
//   expirationDate: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
// }

// interface OrderData {
//   items: CartItem[];
//   billingAddress: Address;
//   deliveryAddress: Address;
//   paymentDetails: PaymentDetails;
//   subtotal: number;
//   total: number;
// }

async function generateOrderNumber(db: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  // Get the last order number for this year
  const lastOrder = await db
    .collection("orders")
    .findOne(
      { orderNumber: { $regex: `^${prefix}` } },
      { sort: { orderNumber: -1 } }
    );

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, "0")}`;
}

async function sendGuestOrderConfirmation(email: any, order: any) {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    throw new Error("Brevo API key not configured");
  }

  const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .order-details { background-color: #fff; padding: 20px; border: 1px solid #ddd; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          .address-section { margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="order-details">
            <h2>Order #${order.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <div class="address-section">
              <h3>Billing Address</h3>
              <p>${order.billingAddress.fullAddress}</p>
              
              <h3>Delivery Address</h3>
              <p>${order.deliveryAddress.fullAddress}</p>
            </div>
            
            <h3>Order Items</h3>
            ${order.items
              .map(
                (item: any) => `
              <div class="item">
                <p><strong>${item.title}</strong></p>
                <p>Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(
                  item.quantity * item.price
                ).toFixed(2)}</p>
              </div>
            `
              )
              .join("")}
            
            <div class="total">
              <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
              <p>Delivery: Free</p>
              <p>Total: $${order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>We'll send you another email when your order ships.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const emailData = {
    sender: {
      name: "Your Store Name",
      email: process.env.FROM_EMAIL || "noreply@yourstore.com",
    },
    to: [
      {
        email: order.userEmail,
        name: `${order.paymentDetails.firstName} ${order.paymentDetails.lastName}`,
      },
    ],
    subject: `Order Confirmation - ${order.orderNumber}`,
    htmlContent: emailTemplate,
    textContent: `
        Order Confirmation - ${order.orderNumber}
        
        Thank you for your order!
        
        Order Date: ${new Date(order.createdAt).toLocaleDateString()}
        Status: ${order.status}
        
        Billing Address: ${order.billingAddress.fullAddress}
        Delivery Address: ${order.deliveryAddress.fullAddress}
        
        Items:
        ${order.items
          .map(
            (item: any) =>
              `${item.title} - Qty: ${item.quantity} × $${item.price.toFixed(
                2
              )} = $${(item.quantity * item.price).toFixed(2)}`
          )
          .join("\n")}
        
        Total: $${order.total.toFixed(2)}
        
        We'll send you another email when your order ships.
      `,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

async function sendOrderConfirmation(email: any, order: any) {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    throw new Error("Brevo API key not configured");
  }

  const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .order-details { background-color: #fff; padding: 20px; border: 1px solid #ddd; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          .address-section { margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="order-details">
            <h2>Order #${order.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <div class="address-section">
              <h3>Billing Address</h3>
              <p>${order.billingAddress.fullAddress}</p>
              
              <h3>Delivery Address</h3>
              <p>${order.deliveryAddress.fullAddress}</p>
            </div>
            
            <h3>Order Items</h3>
            ${order.items
              .map(
                (item: any) => `
              <div class="item">
                <p><strong>${item.title}</strong></p>
                <p>Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(
                  item.quantity * item.price
                ).toFixed(2)}</p>
              </div>
            `
              )
              .join("")}
            
            <div class="total">
              <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
              <p>Delivery: Free</p>
              <p>Total: $${order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>We'll send you another email when your order ships.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const emailData = {
    sender: {
      name: "Your Store Name",
      email: process.env.FROM_EMAIL || "noreply@yourstore.com",
    },
    to: [
      {
        email: order.userEmail,
        name: `${order.paymentDetails.firstName} ${order.paymentDetails.lastName}`,
      },
    ],
    subject: `Order Confirmation - ${order.orderNumber}`,
    htmlContent: emailTemplate,
    textContent: `
        Order Confirmation - ${order.orderNumber}
        
        Thank you for your order!
        
        Order Date: ${new Date(order.createdAt).toLocaleDateString()}
        Status: ${order.status}
        
        Billing Address: ${order.billingAddress.fullAddress}
        Delivery Address: ${order.deliveryAddress.fullAddress}
        
        Items:
        ${order.items
          .map(
            (item: any) =>
              `${item.title} - Qty: ${item.quantity} × $${item.price.toFixed(
                2
              )} = $${(item.quantity * item.price).toFixed(2)}`
          )
          .join("\n")}
        
        Total: $${order.total.toFixed(2)}
        
        We'll send you another email when your order ships.
      `,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    // Get session
    // const session = await getServerSession(options);
    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Parse request body
    const orderData: any = await req.json();

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (orderData.isGuestOrder && !orderData.userEmail) {
      console.log(`${orderData.isGuestOrder} || ${orderData.userEmail}`);
      return NextResponse.json(
        { error: "Email is required for guest orders" },
        { status: 400 }
      );
    }

    if (!orderData.isGuestOrder && !orderData.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    // await client.connect();
    // const db = client.db(process.env.MONGODB_DB_NAME || "your-app-name");

    const client = await clientPromise;
    const db = client.db();
    // const ordersCollection = db.collection("orders");

    // Generate order number
    const orderNumber = await generateOrderNumber(db);

    // Create order object
    const order = {
      orderNumber,
      // userId: session.user.id, // Using email as user identifier
      userEmail: orderData.userEmail,
      ...(orderData.isGuestOrder
        ? {
            guestInfo: {
              firstName: orderData.paymentDetails.firstName,
              lastName: orderData.paymentDetails.lastName,
              phone: orderData.paymentDetails.phone,
            },
          }
        : { userId: orderData.userId }),
      isGuestOrder: orderData.isGuestOrder,
      items: orderData.items,
      billingAddress: orderData.billingAddress,
      deliveryAddress: orderData.deliveryAddress,
      paymentDetails: orderData.paymentDetails,
      //   {
      //     // Don't store sensitive payment info in production
      //     firstName: orderData.paymentDetails.firstName,
      //     lastName: orderData.paymentDetails.lastName,
      //     phone: orderData.paymentDetails.phone,
      //     cardHolder: orderData.paymentDetails.cardHolder,
      //     // Mask card number (only last 4 digits)
      //     cardNumber: `****-****-****-${orderData.paymentDetails.cardNumber.slice(
      //       -4
      //     )}`,
      //     // Don't store CVV
      //     expirationDate: orderData.paymentDetails.expirationDate,
      //   },
      subtotal: orderData.subtotal,
      deliveryFee: 0,
      total: orderData.total,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert order into database
    const result = await db.collection("orders").insertOne(order);

    if (!result.insertedId) {
      throw new Error("Failed to create order");
    }

    // Send confirmation email
    try {
      // await sendOrderConfirmationEmail(order);
      if (orderData.isGuestOrder) {
        await sendGuestOrderConfirmation(orderData.userEmail, order);
      } else {
        await sendOrderConfirmation(orderData.userId, order);
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue with order creation even if email fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: result.insertedId,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
  //   finally {
  //     await client.close();
  //   }
}
