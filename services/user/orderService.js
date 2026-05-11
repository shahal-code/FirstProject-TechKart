import Order from "../../models/ordersModel.js";
import Cart from "../../models/cartModel.js";
import Product from "../../models/productModel.js";

class OrderService {
    async createOrder(userId, address, paymentMethod) {
        // Fetch Cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) throw new Error("Your cart is empty.");

        // Validate Stock and Prepare Items
        let subtotal = 0;
        const orderedItems = cart.items.map(item => {
            const variant = item.productId.variants.find(v => v._id.toString() === item.variantId.toString());
            if (!variant) throw new Error("Product variant not found.");
            if (variant.stock < item.quantity) throw new Error(`Not enough stock for ${item.productId.name}`);

            subtotal += variant.price * item.quantity;
            return {
                product: item.productId._id,
                variantId: item.variantId,
                quantity: item.quantity,
                price: variant.price
            };
        });

        // Final Calculations
        const tax = subtotal * 0.18;
        const finalAmount = subtotal + tax;

        //  Save Order
        const order = new Order({
            userId,
            orderId: `ORD-${Date.now().toString().slice(-8)}`, // Simple unique ID
            orderedItems,
            totalPrice: subtotal,
            finalAmount,
            shippingAddress: {
                fullname: address.fullname,
                phone: address.phone,
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                postal_code: address.postal_code
            },
            paymentMethod,
            status: 'Pending',
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
        });

        await order.save();

        // Atomic Stock Update
        for (const item of cart.items) {
            await Product.updateOne(
                { _id: item.productId._id, "variants._id": item.variantId },
                { $inc: { "variants.$.stock": -item.quantity } }
            );
        }

        //  Clear Cart
        await Cart.deleteOne({ userId });

        return order;
    }
}

export default new OrderService();
