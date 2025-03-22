import express from "express";
import userRoutes from "./routes/userRoutes";
import { createLog } from "./utils/commons";
import { LogCategory, Operation, LogType } from "./utils/enum";

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use("/users", userRoutes);

/**
 * Starts the Express server.
 */
function startServer() {
    app.listen(PORT, () => {
        createLog(
            LogType.DEBUG,
            Operation.STATUS,
            LogCategory.SERVER,
            `🚀 Server running on port ${PORT}`,
        )
    })
}

startServer();
