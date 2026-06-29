import * as walletService from "../../services/user/walletService.js";
import * as ProfileService from "../../services/user/profileService.js";
import { WALLET_MESSAGES, AUTH_MESSAGES } from "../../constants/messages.js";

export const getWalletView = async (req, res) => {
    try {
        const userId = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const [user, walletData] = await Promise.all([
            ProfileService.getProfile(userId),
            walletService.getWalletWithTransactions(userId, page, limit)
        ]);

        res.render("user/wallet/wallet", {
            path: "/user/wallet",
            user,
            loginMethod: req.session.loginMethod || "email",
            balance: walletData.balance,
            transactions: walletData.transactions,
            totalPages: walletData.totalPages,
            currentPage: walletData.currentPage,
            total: walletData.total
        });
    } catch (error) {
        console.error("Wallet View Error:", error);
        res.status(500).send(AUTH_MESSAGES.INTERNAL_SERVER_ERROR);
    }
};

export const getWalletBalance = async (req, res) => {
    try {
        const userId = req.session.user;
        const wallet = await walletService.getOrCreateWallet(userId);
        res.json({ success: true, balance: wallet.balance });
    } catch (error) {
        res.status(500).json({ success: false, message: WALLET_MESSAGES.FETCH_BALANCE_FAILED });
    }
};

