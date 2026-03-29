import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import expenseReducer from "./slices/expenseSlice";
import ruleReducer from "./slices/ruleSlice";
import analyticsReducer from "./slices/analyticsSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        expenses: expenseReducer,
        rules: ruleReducer,
        analytics: analyticsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types (e.g. File objects in OCR scan)
                ignoredActions: ["expenses/scanReceipt/pending", "expenses/scanReceipt/fulfilled"],
            },
        }),
});

export default store;