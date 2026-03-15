import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import storesRouter from "./stores";
import productsRouter from "./products";
import ordersRouter from "./orders";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(storesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(statsRouter);

export default router;
