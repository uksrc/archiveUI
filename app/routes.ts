import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route(
        "/observations",
        "routes/observations.tsx"
    ),

] satisfies RouteConfig;
