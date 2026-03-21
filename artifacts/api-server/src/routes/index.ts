import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import parkingLotsRouter from "./parking-lots";
import parkingSlotsRouter from "./parking-slots";
import bookingsRouter from "./bookings";
import paymentsRouter from "./payments";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/parking-lots", parkingLotsRouter);
router.use("/parking-lots", parkingSlotsRouter);
router.use("/bookings", bookingsRouter);
router.use("/payments", paymentsRouter);
router.use("/reviews", reviewsRouter);
router.use("/admin", adminRouter);

export default router;
