"use server";
import { auth } from "@/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createSetupIntent({ customerId }) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set in environment variables");
  }
  if (!stripe) {
    throw new Error("Stripe client is not initialized");
  }
  const session = await auth();
  if (!session) {
    throw new Error("User is not authenticated");
  }
  if (!session.user || !session.user.id) {
    throw new Error("User ID is not available in session");
  }
  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"], // Specify the payment method types you want to support
      customer: customerId, // Associate the setup intent with the customer
      metadata: {
        // Add any additional metadata you want to associate with the setup intent
        customer_id: customerId,
        created_by: "system", // Example metadata
      },
      usage: "off_session", // Specify that this setup intent is for off-session usage
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  } catch (error) {
    console.error("Error creating Setup Intent:", error);
    throw new Error("Failed to create setup intent");
  }
}
export async function retrieveSetupIntent(setupIntentId) {
  try {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    return setupIntent;
  } catch (error) {
    console.error("Error retrieving Setup Intent:", error);
    throw new Error("Failed to retrieve setup intent");
  }
}
export async function cancelSetupIntent(setupIntentId) {
  try {
    const canceledSetupIntent = await stripe.setupIntents.cancel(setupIntentId);
    return canceledSetupIntent;
  } catch (error) {
    console.error("Error canceling Setup Intent:", error);
    throw new Error("Failed to cancel setup intent");
  }
}
export async function confirmSetupIntent(setupIntentId, paymentMethodId) {
  try {
    const confirmedSetupIntent = await stripe.setupIntents.confirm(
      setupIntentId,
      {
        payment_method: paymentMethodId,
      }
    );
    return confirmedSetupIntent;
  } catch (error) {
    console.error("Error confirming Setup Intent:", error);
    throw new Error("Failed to confirm setup intent");
  }
}
export async function updateSetupIntent(setupIntentId, metadata) {
  try {
    const updatedSetupIntent = await stripe.setupIntents.update(setupIntentId, {
      metadata: metadata,
    });
    return updatedSetupIntent;
  } catch (error) {
    console.error("Error updating Setup Intent:", error);
    throw new Error("Failed to update setup intent");
  }
}
export async function listSetupIntents(customerId) {
  try {
    const setupIntents = await stripe.setupIntents.list({
      customer: customerId,
      limit: 100, // Adjust the limit as needed
    });
    return setupIntents;
  } catch (error) {
    console.error("Error listing Setup Intents:", error);
    throw new Error("Failed to list setup intents");
  }
}
export async function deleteSetupIntent(setupIntentId) {
  try {
    const deletedSetupIntent = await stripe.setupIntents.del(setupIntentId);
    return deletedSetupIntent;
  } catch (error) {
    console.error("Error deleting Setup Intent:", error);
    throw new Error("Failed to delete setup intent");
  }
}
export async function createPaymentMethod(cardDetails) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: cardDetails,
    });
    return paymentMethod;
  } catch (error) {
    console.error("Error creating Payment Method:", error);
    throw new Error("Failed to create payment method");
  }
}
export async function attachPaymentMethodToCustomer(
  customerId,
  paymentMethodId
) {
  try {
    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethodId,
      {
        customer: customerId,
      }
    );
    return attachedPaymentMethod;
  } catch (error) {
    console.error("Error attaching Payment Method to Customer:", error);
    throw new Error("Failed to attach payment method to customer");
  }
}
export async function detachPaymentMethod(paymentMethodId) {
  try {
    const detachedPaymentMethod = await stripe.paymentMethods.detach(
      paymentMethodId
    );
    return detachedPaymentMethod;
  } catch (error) {
    console.error("Error detaching Payment Method:", error);
    throw new Error("Failed to detach payment method");
  }
}
export async function retrievePaymentMethod(paymentMethodId) {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error("Error retrieving Payment Method:", error);
    throw new Error("Failed to retrieve payment method");
  }
}
export async function listPaymentMethods(customerId) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 100, // Adjust the limit as needed
    });
    return paymentMethods;
  } catch (error) {
    console.error("Error listing Payment Methods:", error);
    throw new Error("Failed to list payment methods");
  }
}
export async function deletePaymentMethod(paymentMethodId) {
  try {
    const deletedPaymentMethod = await stripe.paymentMethods.del(
      paymentMethodId
    );
    return deletedPaymentMethod;
  } catch (error) {
    console.error("Error deleting Payment Method:", error);
    throw new Error("Failed to delete payment method");
  }
}
export async function updatePaymentMethod(paymentMethodId, updates) {
  try {
    const updatedPaymentMethod = await stripe.paymentMethods.update(
      paymentMethodId,
      updates
    );
    return updatedPaymentMethod;
  } catch (error) {
    console.error("Error updating Payment Method:", error);
    throw new Error("Failed to update payment method");
  }
}
// update customer default payment method
export async function updateCustomerDefaultPaymentMethod({
  customerId,
  paymentMethodId,
}) {
  try {
    const updatedCustomer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating Customer Default Payment Method:", error);
    throw new Error("Failed to update customer default payment method");
  }
}
export async function retrieveCustomer(customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error("Error retrieving Customer:", error);
    throw new Error("Failed to retrieve customer");
  }
}
// Create Subscription
export async function createSubscription({
  customerId,
  priceId,
  defaultPaymentMethod,
}) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: defaultPaymentMethod,
      expand: ["latest_invoice.payment_intent"],
    });
    return subscription;
  } catch (error) {
    console.error("Error creating Subscription:", error);
    throw new Error("Failed to create subscription");
  }
}

// Create Stripe Product for Subscription Plan
export async function createStripeProduct({
  name,
  description,
  planId,
  features,
}) {
  try {
    const product = await stripe.products.create({
      name: name,
      description: description,
      metadata: {
        plan_id: planId, // Store the plan ID in metadata for reference
        features: features ? features.join(", ") : "", // Join features array into a comma-separated string
      },
    });
    return product;
  } catch (error) {
    console.error("Error creating Stripe Product:", error);
    throw new Error("Failed to create Stripe product");
  }
}

// Create Stripe Price for Subscription Plan
export async function createStripePrice({
  price,
  currency = "gbp",
  interval = "month", // Default to monthly, can be changed to 'year' for yearly plans
  stripeProductId,
  planId,
}) {
  try {
    const priceData = await stripe.prices.create({
      unit_amount: price * 100, // Convert to cents
      currency: currency,
      //   nickname: `${plan.name} Monthly`,
      recurring: { interval: interval }, // Set the billing interval
      product: stripeProductId, // Use the product ID created earlier
      metadata: {
        plan_id: planId, // Store the plan ID in metadata for reference
      },
    });
    return priceData;
  } catch (error) {
    console.error("Error creating Stripe Price:", error);
    throw new Error("Failed to create Stripe price");
  }
}

// List all products and their prices
export async function listStripeProducts() {
  try {
    const products = await stripe.products.list({
      limit: 100, // Adjust the limit as needed
    });
    // Fetch prices for each product
    for (const product of products.data) {
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 100, // Adjust the limit as needed
      });
      product.prices = prices.data; // Attach prices to the product
    }
    return products.data;
  } catch (error) {
    console.error("Error listing Stripe Products:", error);
    throw new Error("Failed to list Stripe products");
  }
}

export async function deleteStripeProduct(productId) {
  try {
    const deletedProduct = await stripe.products.del(productId);
    return deletedProduct;
  } catch (error) {
    console.error("Error deleting Stripe Product:", error);
    throw new Error("Failed to delete Stripe product");
  }
}

// Delete all Stripe Products and Prices
export async function deleteAllStripeProducts() {
  try {
    const products = await stripe.products.list({
      limit: 100, // Adjust the limit as needed
    });
    for (const product of products.data) {
      // Delete each product
      await stripe.products.del(product.id);
    }
    return {
      success: true,
      message: "All Stripe products deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting all Stripe Products:", error);
    throw new Error("Failed to delete all Stripe products");
  }
}

// create Stripe Customer
export async function createStripeCustomer({ email, name, metadata }) {
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: metadata || {},
    });
    return customer;
  } catch (error) {
    console.error("Error creating Stripe Customer:", error);
    throw new Error("Failed to create Stripe customer");
  }
}
