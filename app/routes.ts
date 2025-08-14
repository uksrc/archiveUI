import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    // route(
    //     "/.well-known/appspecific/com.chrome.devtools.json",
    //     "routes/debug-null.tsx",
    //),

] satisfies RouteConfig;
