import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { hasInjectionContext, getCurrentInstance, defineComponent, computed, h, ref, watch, Teleport, provide, nextTick, useId, useSSRContext, createApp, inject, getCurrentScope, onScopeDispose, unref as unref$1, mergeProps, withCtx, createTextVNode, createVNode, onErrorCaptured, onServerPrefetch, resolveDynamicComponent, shallowReactive, reactive, effectScope, defineAsyncComponent, toRef, isReadonly, isRef, isShallow, isReactive, toRaw } from 'vue';
import { s as parseURL, f as encodePath, d as decodePath, l as hasProtocol, n as isScriptProtocol, p as joinURL, y as withQuery, t as sanitizeStatusCode, g as getContext, $ as $fetch, a as createHooks, c as createError$1, m as isEqual, u as stringifyParsedURL, v as stringifyQuery, r as parseQuery, e as defu } from '../nitro/nitro.mjs';
import { b as baseURL } from '../routes/renderer.mjs';
import { ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.6";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin) {
    const unresolvedPluginsForThisPlugin = plugin.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin).then(async () => {
        if (plugin._name) {
          resolvedPlugins.add(plugin._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin._name)) {
              dependsOn.delete(plugin._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin);
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = encodeForHtmlAttr(location2);
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_XREqeTxZMFGnVM2OSZfUluXrnhsy44RcpakfizqvbnA = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher().map((r) => r.data).reverse());
const routeRulesMatcher = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  const route = fullPath && typeof fullPath === "object" ? fullPath : {};
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: void 0,
    matched: route.matched || [],
    redirectedFrom: void 0,
    meta: route.meta || {},
    href: fullPath
  };
}
const router_PuAEK5xLPJxT2fsSQ_PHKHaH8waBLsq2VneRvgVuO6Y = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return await handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          const route2 = router.resolve(props.to);
          return props.custom ? slots.default?.({ href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    const initialLayoutProps = nuxtApp.payload.state._layoutProps;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
          to.meta.layoutProps = initialLayoutProps;
        }
        nuxtApp._processingMiddleware = true;
        if (!nuxtApp.ssrContext?.islandContext) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          const routeRules = getRouteRules({ path: to.path });
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              const guard = nuxtApp._middleware.named[key];
              if (!guard) {
                continue;
              }
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(guard);
              } else {
                middlewareEntries.delete(guard);
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MC8J_ah33Fb5ftqekqA7gERLFKwkJOXwcR2lYl_FdIw = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_XREqeTxZMFGnVM2OSZfUluXrnhsy44RcpakfizqvbnA,
  router_PuAEK5xLPJxT2fsSQ_PHKHaH8waBLsq2VneRvgVuO6Y,
  revive_payload_server_MC8J_ah33Fb5ftqekqA7gERLFKwkJOXwcR2lYl_FdIw,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4
];
function classNames(...classes) {
  let result = "";
  for (const cls of classes) {
    if (cls && cls !== "") {
      result += (result ? " " : "") + String(cls);
    }
  }
  return result;
}
var isRecord = (val) => typeof val === "object" && val !== null;
var toClassString = (input) => {
  if (!input) return "";
  if (typeof input === "string" || typeof input === "number") {
    return String(input);
  }
  if (Array.isArray(input)) {
    return input.map((item) => toClassString(item)).filter(Boolean).join(" ");
  }
  if (isRecord(input)) {
    return Object.keys(input).filter((key) => Boolean(input[key])).join(" ");
  }
  return "";
};
function coerceClassValue(input) {
  if (input === null || input === void 0 || input === false) return input;
  if (typeof input === "string" || typeof input === "number") return input;
  const normalized = toClassString(input);
  return normalized ? normalized : void 0;
}
function composeComponentClasses(...inputs) {
  const out = [];
  for (const item of inputs) {
    if (item == null || item === false || item === 0 || item === "") continue;
    if (typeof item === "string" || typeof item === "number") {
      out.push(item);
      continue;
    }
    const coerced = coerceClassValue(item);
    if (coerced) out.push(coerced);
  }
  return classNames(...out);
}
var isRecord2 = (val) => typeof val === "object" && val !== null;
var isStyleObject = (val) => {
  if (!isRecord2(val)) return false;
  for (const key of Object.keys(val)) {
    const v = val[key];
    if (v === void 0) continue;
    if (typeof v !== "string" && typeof v !== "number") return false;
  }
  return true;
};
function coerceStyleValue(input) {
  if (!input) return void 0;
  if (typeof input === "string") return input;
  if (Array.isArray(input)) {
    const parts = [];
    for (const item of input) {
      const coerced = coerceStyleValue(item);
      if (!coerced) continue;
      if (Array.isArray(coerced)) {
        parts.push(...coerced);
      } else {
        parts.push(coerced);
      }
    }
    if (parts.length === 0) return void 0;
    return parts;
  }
  if (isStyleObject(input)) return input;
  return void 0;
}
function mergeStyleValues(...inputs) {
  const parts = [];
  for (const input of inputs) {
    const coerced = coerceStyleValue(input);
    if (!coerced) continue;
    if (Array.isArray(coerced)) {
      parts.push(...coerced);
    } else {
      parts.push(coerced);
    }
  }
  if (parts.length === 0) return void 0;
  if (parts.length === 1) return parts[0];
  return parts;
}
var icon20ViewBox = "0 0 20 20";
var closeSolidIcon20PathD = "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z";
var calendarSolidIcon20PathD = "M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z";
var chevronLeftSolidIcon20PathD = "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z";
var chevronRightSolidIcon20PathD = "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z";
var CalendarIconPath = calendarSolidIcon20PathD;
var CloseIconPath = closeSolidIcon20PathD;
var ChevronLeftIconPath = chevronLeftSolidIcon20PathD;
var ChevronRightIconPath = chevronRightSolidIcon20PathD;
function normalizeSvgAttrs(svgAttrs) {
  if ("className" in svgAttrs && !("class" in svgAttrs)) {
    const { className, ...rest } = svgAttrs;
    return {
      ...rest,
      class: className
    };
  }
  return svgAttrs;
}
var TIGER_LOCALE_KEYS = [
  "locale",
  "direction",
  "common",
  "modal",
  "drawer",
  "upload",
  "pagination",
  "datePicker",
  "formWizard",
  "taskBoard"
];
function isRecord3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isPromiseLike(value) {
  return isRecord3(value) && typeof value.then === "function";
}
function hasTigerLocaleShape(value) {
  if (!isRecord3(value)) return false;
  return TIGER_LOCALE_KEYS.some((key) => key in value);
}
function resolveTigerLocaleModule(module) {
  if (!isRecord3(module)) return void 0;
  const moduleRecord = module;
  const defaultExport = moduleRecord.default;
  if (hasTigerLocaleShape(defaultExport)) return defaultExport;
  for (const value of Object.values(moduleRecord)) {
    if (hasTigerLocaleShape(value)) return value;
  }
  return module;
}
function isLazyTigerLocale(locale) {
  return typeof locale === "function" || isPromiseLike(locale);
}
function getImmediateTigerLocale(locale) {
  if (!locale || isLazyTigerLocale(locale)) return void 0;
  return locale;
}
async function resolveTigerLocale(locale) {
  if (!locale) return void 0;
  const loaded = typeof locale === "function" ? await locale() : isPromiseLike(locale) ? await locale : locale;
  return resolveTigerLocaleModule(loaded);
}
function mergeTigerLocale(base, override) {
  if (!base && !override) return void 0;
  return {
    locale: override?.locale ?? base?.locale,
    direction: override?.direction ?? base?.direction,
    common: { ...base?.common, ...override?.common },
    modal: { ...base?.modal, ...override?.modal },
    drawer: { ...base?.drawer, ...override?.drawer },
    upload: { ...base?.upload, ...override?.upload },
    pagination: { ...base?.pagination, ...override?.pagination },
    datePicker: { ...base?.datePicker, ...override?.datePicker },
    formWizard: { ...base?.formWizard, ...override?.formWizard },
    taskBoard: { ...base?.taskBoard, ...override?.taskBoard }
  };
}
var RTL_LANGUAGE_CODES = /* @__PURE__ */ new Set(["ar", "fa", "he", "iw", "ps", "ur"]);
function isRtlLocale(locale) {
  if (!locale) return false;
  if (typeof locale !== "string") {
    if (locale.direction) return locale.direction === "rtl";
    return isRtlLocale(locale.locale);
  }
  const language = locale.split("-")[0]?.toLowerCase();
  return RTL_LANGUAGE_CODES.has(language);
}
function getLocaleDirection(locale) {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
var EN_US_DATEPICKER_LOCALE = {
  labels: {
    today: "Today",
    ok: "OK",
    calendar: "Calendar",
    toggleCalendar: "Toggle calendar",
    clearDate: "Clear date",
    previousMonth: "Previous month",
    nextMonth: "Next month"
  }
};
var ZH_CN_DATEPICKER_LOCALE = {
  labels: {
    today: "今天",
    ok: "确定",
    calendar: "日历",
    toggleCalendar: "打开日历",
    clearDate: "清除日期",
    previousMonth: "上个月",
    nextMonth: "下个月"
  }
};
var DATEPICKER_LABELS_BY_LANGUAGE = {
  en: EN_US_DATEPICKER_LOCALE.labels,
  zh: ZH_CN_DATEPICKER_LOCALE.labels,
  es: {
    today: "Hoy",
    ok: "Aceptar",
    calendar: "Calendario",
    toggleCalendar: "Abrir calendario",
    clearDate: "Borrar fecha",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente"
  },
  fr: {
    today: "Aujourd'hui",
    ok: "OK",
    calendar: "Calendrier",
    toggleCalendar: "Ouvrir le calendrier",
    clearDate: "Effacer la date",
    previousMonth: "Mois précédent",
    nextMonth: "Mois suivant"
  },
  de: {
    today: "Heute",
    ok: "OK",
    calendar: "Kalender",
    toggleCalendar: "Kalender öffnen",
    clearDate: "Datum löschen",
    previousMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat"
  },
  pt: {
    today: "Hoje",
    ok: "OK",
    calendar: "Calendário",
    toggleCalendar: "Abrir calendário",
    clearDate: "Limpar data",
    previousMonth: "Mês anterior",
    nextMonth: "Próximo mês"
  },
  ar: {
    today: "اليوم",
    ok: "موافق",
    calendar: "التقويم",
    toggleCalendar: "فتح التقويم",
    clearDate: "مسح التاريخ",
    previousMonth: "الشهر السابق",
    nextMonth: "الشهر التالي"
  }
};
function isDatePickerLocaleConfig(value) {
  return Boolean(value && typeof value === "object" && "datePicker" in value);
}
function getLocalePreset(locale) {
  if (!locale || typeof locale === "string") return null;
  if (isDatePickerLocaleConfig(locale)) return locale.datePicker ?? null;
  return locale;
}
function getDatePickerLocaleCode(locale) {
  if (typeof locale === "string") return locale;
  return getLocalePreset(locale)?.locale;
}
function getDefaultDatePickerLabels(locale) {
  const lc = (getDatePickerLocaleCode(locale) ?? "").toLowerCase();
  const language = lc.split("-")[0];
  return DATEPICKER_LABELS_BY_LANGUAGE[language] ?? EN_US_DATEPICKER_LOCALE.labels;
}
function getDatePickerLabels(locale, overrides) {
  return {
    ...getDefaultDatePickerLabels(locale),
    ...getLocalePreset(locale)?.labels ?? {},
    ...overrides ?? {}
  };
}
var buttonBaseClasses = "inline-flex items-center justify-center font-medium rounded-[var(--tiger-radius-md,0.5rem)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 active:scale-[0.98]";
var buttonSizeClasses = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl"
};
var buttonDisabledClasses = "cursor-not-allowed opacity-60";
var buttonDangerClasses = {
  primary: "bg-[var(--tiger-error,#dc2626)] hover:bg-[var(--tiger-error-hover,#b91c1c)] text-white focus:ring-[var(--tiger-error,#dc2626)] disabled:bg-[var(--tiger-error-disabled,#fca5a5)]",
  secondary: "bg-[var(--tiger-error,#dc2626)] hover:bg-[var(--tiger-error-hover,#b91c1c)] text-white focus:ring-[var(--tiger-error,#dc2626)] disabled:bg-[var(--tiger-error-disabled,#fca5a5)]",
  outline: "bg-transparent hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] text-[var(--tiger-error,#dc2626)] border-2 border-[var(--tiger-error,#dc2626)] focus:ring-[var(--tiger-error,#dc2626)] disabled:border-[var(--tiger-error-disabled,#fca5a5)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]",
  ghost: "bg-transparent hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] text-[var(--tiger-error,#dc2626)] focus:ring-[var(--tiger-error,#dc2626)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]",
  link: "bg-transparent hover:underline text-[var(--tiger-error,#dc2626)] focus:ring-[var(--tiger-error,#dc2626)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]"
};
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}
function getIntlOptionsFromDateFormat(format) {
  switch (format) {
    case "yyyy-MM-dd":
    case "yyyy/MM/dd":
      return { year: "numeric", month: "2-digit", day: "2-digit" };
    case "MM/dd/yyyy":
      return { year: "numeric", month: "2-digit", day: "2-digit" };
    case "dd/MM/yyyy":
      return { year: "numeric", month: "2-digit", day: "2-digit" };
    default:
      return { year: "numeric", month: "2-digit", day: "2-digit" };
  }
}
function formatDate(date, format = "yyyy-MM-dd", locale) {
  if (!date || isNaN(date.getTime())) return "";
  if (locale) {
    const localized = safeIntlFormat(locale, getIntlOptionsFromDateFormat(format), date);
    if (localized) return localized;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  switch (format) {
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "MM/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`;
    case "yyyy/MM/dd":
      return `${year}/${month}/${day}`;
    default:
      return `${year}-${month}-${day}`;
  }
}
function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}
function normalizeDate(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}
function isDateInRange(date, minDate, maxDate) {
  if (isNaN(date.getTime())) return false;
  const normalizedDate = normalizeDate(date);
  if (minDate && !isNaN(minDate.getTime())) {
    if (normalizedDate < normalizeDate(minDate)) return false;
  }
  if (maxDate && !isNaN(maxDate.getTime())) {
    if (normalizedDate > normalizeDate(maxDate)) return false;
  }
  return true;
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
var calendarMonthDaysCache = /* @__PURE__ */ new Map();
var maxCalendarMonthDaysCacheSize = 48;
function getNormalizedMonth(year, month) {
  const date = new Date(year, month, 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth()
  };
}
function getCalendarMonthDaysCacheKey(year, month) {
  return `${year}:${month}`;
}
function getCalendarDayTimeValues(year, month) {
  const normalized = getNormalizedMonth(year, month);
  const cacheKey = getCalendarMonthDaysCacheKey(normalized.year, normalized.month);
  const cachedDays = calendarMonthDaysCache.get(cacheKey);
  if (cachedDays) return cachedDays;
  const firstDay = getFirstDayOfMonth(normalized.year, normalized.month);
  const daysInMonth = getDaysInMonth(normalized.year, normalized.month);
  const daysInPrevMonth = getDaysInMonth(normalized.year, normalized.month - 1);
  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(normalized.year, normalized.month - 1, daysInPrevMonth - i).getTime());
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(normalized.year, normalized.month, i).getTime());
  }
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(normalized.year, normalized.month + 1, i).getTime());
  }
  if (calendarMonthDaysCache.size >= maxCalendarMonthDaysCacheSize) {
    const firstKey = calendarMonthDaysCache.keys().next().value;
    if (firstKey) {
      calendarMonthDaysCache.delete(firstKey);
    }
  }
  const frozenDays = Object.freeze(days);
  calendarMonthDaysCache.set(cacheKey, frozenDays);
  return frozenDays;
}
function getCalendarDays(year, month) {
  return getCalendarDayTimeValues(year, month).map((time) => new Date(time));
}
var intlCache = /* @__PURE__ */ new Map();
function safeIntlFormat(locale, options, date) {
  try {
    const key = `${locale ?? ""}_${JSON.stringify(options)}`;
    let fmt = intlCache.get(key);
    if (!fmt) {
      fmt = new Intl.DateTimeFormat(locale, options);
      intlCache.set(key, fmt);
    }
    return fmt.format(date);
  } catch {
    return "";
  }
}
function formatMonthYear(year, month, locale) {
  if (locale) {
    const text = safeIntlFormat(
      locale,
      { year: "numeric", month: "long" },
      new Date(year, month, 1)
    );
    if (text) return text;
  }
  const monthNames = getMonthNames();
  return `${monthNames[month]} ${year}`;
}
function getMonthNames(locale) {
  const fallback = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  return fallback;
}
function getShortDayNames(locale) {
  const fallback = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (!locale) return fallback;
  const base = new Date(2021, 7, 1);
  const names = Array.from(
    { length: 7 },
    (_, i) => safeIntlFormat(
      locale,
      { weekday: "short" },
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    )
  );
  return names.every(Boolean) ? names : fallback;
}
function isToday(date) {
  const today = /* @__PURE__ */ new Date();
  return isSameDay(date, today);
}
var datePickerBaseClasses = "relative inline-block w-full";
var datePickerInputWrapperClasses = "relative w-full";
function getDatePickerInputClasses(size = "md", disabled = false) {
  const baseClasses2 = [
    "w-full",
    "rounded-[var(--tiger-radius-md,0.5rem)]",
    "border",
    "border-gray-300",
    "bg-white",
    "text-gray-900",
    "placeholder-gray-400",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-[var(--tiger-primary,#2563eb)]",
    "focus:border-transparent",
    "transition-colors",
    "pr-16"
    // Space for clear + calendar buttons
  ];
  const sizeClasses3 = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg"
  };
  const disabledClasses = disabled ? ["bg-gray-100", "cursor-not-allowed", "text-gray-500"] : ["cursor-pointer"];
  return classNames(...baseClasses2, sizeClasses3[size], ...disabledClasses);
}
function getDatePickerIconButtonClasses(size = "md") {
  const baseClasses2 = [
    "absolute",
    "right-0",
    "top-0",
    "bottom-0",
    "flex",
    "items-center",
    "justify-center",
    "text-gray-400",
    "hover:text-gray-600",
    "transition-colors"
  ];
  const sizeClasses3 = {
    sm: "px-2",
    md: "px-3",
    lg: "px-4"
  };
  return classNames(...baseClasses2, sizeClasses3[size]);
}
var datePickerCalendarClasses = classNames(
  "absolute",
  "z-50",
  "mt-1",
  "bg-white",
  "border",
  "border-gray-300",
  "rounded-[var(--tiger-radius-md,0.5rem)]",
  "shadow-lg",
  "p-4",
  "w-80"
);
var datePickerCalendarHeaderClasses = classNames(
  "flex",
  "items-center",
  "justify-between",
  "mb-4"
);
var datePickerNavButtonClasses = classNames(
  "p-2",
  "rounded-[var(--tiger-radius-md,0.5rem)]",
  "hover:bg-gray-100",
  "transition-colors",
  "text-gray-600",
  "hover:text-gray-900",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-[var(--tiger-primary,#2563eb)]"
);
var datePickerMonthYearClasses = classNames("text-base", "font-semibold", "text-gray-900");
var datePickerCalendarGridClasses = classNames("grid", "grid-cols-7", "gap-1");
var datePickerDayNameClasses = classNames(
  "text-center",
  "text-xs",
  "font-medium",
  "text-gray-500",
  "py-2"
);
function getDatePickerDayCellClasses(isCurrentMonth, isSelected, isToday2, isDisabled, isInRange = false, isRangeStart = false, isRangeEnd = false) {
  const base = "w-10 h-10 flex items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] text-sm transition-colors";
  if (isDisabled) {
    return classNames(base, "cursor-not-allowed text-gray-300");
  }
  if (isSelected || isRangeStart || isRangeEnd) {
    return classNames(
      base,
      "cursor-pointer",
      "bg-[var(--tiger-primary,#2563eb)] text-white",
      "hover:bg-[var(--tiger-primary-hover,#1d4ed8)] font-semibold"
    );
  }
  const color = isCurrentMonth ? "text-gray-900" : "text-gray-400";
  const range = isInRange ? "bg-[var(--tiger-outline-bg-hover,#eff6ff)]" : "";
  const today = isToday2 ? "border border-[var(--tiger-primary,#2563eb)] font-semibold" : "";
  return classNames(base, "cursor-pointer hover:bg-gray-100", color, range, today);
}
var datePickerClearButtonClasses = classNames(
  "absolute",
  "right-10",
  "top-1/2",
  "-translate-y-1/2",
  "text-gray-400",
  "hover:text-gray-600",
  "transition-colors",
  "p-1"
);
var datePickerFooterClasses = classNames(
  "mt-3",
  "pt-3",
  "border-t",
  "border-gray-200",
  "flex",
  "items-center",
  "justify-between",
  "gap-2"
);
var datePickerFooterButtonClasses = classNames(
  "px-3",
  "py-1",
  "text-xs",
  "font-medium",
  "rounded",
  "border",
  "border-gray-300",
  "hover:border-gray-400",
  "bg-white",
  "hover:bg-gray-50",
  "text-gray-700",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-[var(--tiger-primary,#2563eb)]",
  "focus:ring-offset-1",
  "transition-colors",
  "duration-150"
);
classNames(
  "absolute inset-0 bg-[var(--tiger-surface,#ffffff)]/80 flex items-center justify-center z-20"
);
classNames(
  "text-gray-600 hover:text-[var(--tiger-primary,#2563eb)]",
  "transition-colors duration-200",
  "focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1 rounded",
  "cursor-pointer"
);
classNames("text-gray-900 font-medium", "cursor-default");
classNames(
  "text-gray-600 hover:text-[var(--tiger-primary,#2563eb)]",
  "transition-colors duration-200 cursor-pointer",
  "focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1 rounded",
  "px-1"
);
function getSpinnerSVG(variant) {
  switch (variant) {
    case "spinner":
    default:
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4",
              fill: "none"
            }
          },
          {
            type: "path",
            attrs: {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            }
          }
        ]
      };
    case "ring":
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "3",
              fill: "none"
            }
          },
          {
            type: "circle",
            attrs: {
              className: "opacity-75",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "3",
              fill: "none",
              strokeLinecap: "round",
              strokeDasharray: "48 16"
            }
          }
        ]
      };
    case "pulse":
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              cx: "12",
              cy: "12",
              r: "10",
              fill: "currentColor"
            }
          }
        ]
      };
  }
}
classNames(
  "tiger-popover-title",
  "text-sm",
  "font-semibold",
  "text-[var(--tiger-text,#111827)]",
  "mb-2",
  "border-b",
  "border-[var(--tiger-border,#e5e7eb)]",
  "pb-2"
);
classNames(
  "tiger-popover-text",
  "text-sm",
  "text-[var(--tiger-text-muted,#374151)]"
);
var defaultThemeColors = {
  primary: {
    bg: "bg-[var(--tiger-primary,#2563eb)]",
    bgHover: "hover:bg-[var(--tiger-primary-hover,#1d4ed8)]",
    text: "text-white",
    focus: "focus:ring-[var(--tiger-primary,#2563eb)]",
    disabled: "disabled:bg-[var(--tiger-primary-disabled,#93c5fd)]"
  },
  secondary: {
    bg: "bg-[var(--tiger-secondary,#4b5563)]",
    bgHover: "hover:bg-[var(--tiger-secondary-hover,#374151)]",
    text: "text-white",
    focus: "focus:ring-[var(--tiger-secondary,#4b5563)]",
    disabled: "disabled:bg-[var(--tiger-secondary-disabled,#9ca3af)]"
  },
  outline: {
    bg: "bg-transparent",
    bgHover: "hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]",
    text: "text-[var(--tiger-primary,#2563eb)]",
    border: "border-2 border-[var(--tiger-primary,#2563eb)]",
    focus: "focus:ring-[var(--tiger-primary,#2563eb)]",
    disabled: "disabled:border-[var(--tiger-primary-disabled,#93c5fd)] disabled:text-[var(--tiger-primary-disabled,#93c5fd)]"
  },
  ghost: {
    bg: "bg-transparent",
    bgHover: "hover:bg-[var(--tiger-ghost-bg-hover,#eff6ff)]",
    text: "text-[var(--tiger-primary,#2563eb)]",
    focus: "focus:ring-[var(--tiger-primary,#2563eb)]",
    disabled: "disabled:text-[var(--tiger-primary-disabled,#93c5fd)]"
  },
  link: {
    bg: "bg-transparent",
    bgHover: "hover:underline",
    text: "text-[var(--tiger-primary,#2563eb)]",
    focus: "focus:ring-[var(--tiger-primary,#2563eb)]",
    disabled: "disabled:text-[var(--tiger-primary-disabled,#93c5fd)]"
  }
};
function getButtonVariantClasses(variant, colors = defaultThemeColors) {
  const scheme = colors[variant];
  const classes = [
    scheme.bg,
    scheme.bgHover,
    scheme.text,
    scheme.border,
    scheme.borderHover,
    scheme.focus,
    scheme.disabled
  ].filter(Boolean);
  return classes.join(" ");
}
var chartCanvasBaseClasses = "block";
var chartAxisLineClasses = "stroke-[color:var(--tiger-border,#e5e7eb)] [stroke-opacity:var(--tiger-chart-axis-line-opacity,1)]";
var chartAxisTickLineClasses = "stroke-[color:var(--tiger-border,#e5e7eb)] [stroke-opacity:var(--tiger-chart-axis-tick-opacity,1)]";
var chartAxisTickTextClasses = "fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs tabular-nums";
var chartAxisLabelClasses = "fill-[color:var(--tiger-text,#374151)] text-xs font-medium tabular-nums";
var chartGridLineClasses = "stroke-[color:var(--tiger-border,#e5e7eb)] [stroke-opacity:var(--tiger-chart-grid-line-opacity,1)]";
var DEFAULT_CHART_COLORS = [
  "var(--tiger-chart-1,#2563eb)",
  "var(--tiger-chart-2,#22c55e)",
  "var(--tiger-chart-3,#f97316)",
  "var(--tiger-chart-4,#a855f7)",
  "var(--tiger-chart-5,#0ea5e9)",
  "var(--tiger-chart-6,#ef4444)"
];
var barValueLabelClasses = "fill-[color:var(--tiger-text,#374151)] text-[11px] font-medium pointer-events-none select-none";
var barValueLabelInsideClasses = "fill-white text-[11px] font-medium pointer-events-none select-none";
var barAnimatedTransition = "transition: y var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), height var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), opacity 200ms ease-out, filter 200ms ease-out";
var clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));
function normalizeChartPadding(padding) {
  if (typeof padding === "number") {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    };
  }
  return {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0
  };
}
function getChartInnerRect(width, height, padding) {
  const resolvedPadding = normalizeChartPadding(padding);
  const innerWidth = Math.max(0, width - resolvedPadding.left - resolvedPadding.right);
  const innerHeight = Math.max(0, height - resolvedPadding.top - resolvedPadding.bottom);
  return {
    x: resolvedPadding.left,
    y: resolvedPadding.top,
    width: innerWidth,
    height: innerHeight
  };
}
function createLinearScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0;
  return {
    type: "linear",
    domain: [d0, d1],
    range: [r0, r1],
    map: (value) => {
      const numeric = typeof value === "number" ? value : Number(value);
      if (span === 0) return (r0 + r1) / 2;
      return r0 + (numeric - d0) / span * (r1 - r0);
    }
  };
}
function createBandScale(domain, range, options = {}) {
  const paddingInner = clampNumber(options.paddingInner ?? 0.1, 0, 1);
  const paddingOuter = clampNumber(options.paddingOuter ?? 0.1, 0, 1);
  const align = clampNumber(options.align ?? 0.5, 0, 1);
  const [rangeStart, rangeEnd] = range;
  const span = rangeEnd - rangeStart;
  const length = Math.abs(span);
  const direction = span >= 0 ? 1 : -1;
  const n = domain.length;
  const step = n > 0 ? length / Math.max(1, n - paddingInner + paddingOuter * 2) : 0;
  const bandwidth = step * (1 - paddingInner);
  const offset2 = (length - step * (n - paddingInner)) * align;
  const indexMap = new Map(domain.map((value, index) => [value, index]));
  return {
    type: "band",
    domain,
    range: [rangeStart, rangeEnd],
    step,
    bandwidth,
    map: (value) => {
      const key = String(value);
      const index = indexMap.get(key) ?? 0;
      return rangeStart + direction * (offset2 + step * index);
    }
  };
}
function getNumberExtent(values, options = {}) {
  const fallback = options.fallback ?? [0, 1];
  if (values.length === 0) return fallback;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (options.includeZero) {
    min = Math.min(min, 0);
    max = Math.max(max, 0);
  }
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    return [min - pad, max + pad];
  }
  const padding = options.padding ?? 0;
  if (padding > 0) {
    const span = max - min;
    min -= span * padding;
    max += span * padding;
  }
  return [min, max];
}
var linearTickValuesCache = /* @__PURE__ */ new Map();
var maxLinearTickValuesCacheSize = 128;
function getChartAxisTicks(scale, options = {}) {
  const { tickCount = 5, tickValues, tickFormat } = options;
  const format = tickFormat ?? ((value) => `${value}`);
  const resolvedTickValues = tickValues ?? (scale.type === "linear" ? getLinearChartTickValues(scale.domain, tickCount) : scale.domain);
  return resolvedTickValues.map((value) => {
    const basePosition = scale.map(value);
    const position = scale.type === "band" && typeof scale.bandwidth === "number" ? basePosition + scale.bandwidth / 2 : basePosition;
    return {
      value,
      position,
      label: format(value)
    };
  });
}
function getLinearTickCacheKey(min, max, count) {
  return `${min}:${max}:${count}`;
}
function getLinearChartTickValues(domain, count) {
  const min = Math.min(domain[0], domain[1]);
  const max = Math.max(domain[0], domain[1]);
  if (min === max || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [min];
  }
  const cacheKey = getLinearTickCacheKey(min, max, count);
  const cachedTicks = linearTickValuesCache.get(cacheKey);
  if (cachedTicks) return cachedTicks;
  const step = getNiceStep((max - min) / Math.max(1, count));
  const start = Math.ceil(min / step) * step;
  const end = Math.floor(max / step) * step;
  const ticks = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(roundTick(value, step));
  }
  if (linearTickValuesCache.size >= maxLinearTickValuesCacheSize) {
    const firstKey = linearTickValuesCache.keys().next().value;
    if (firstKey) {
      linearTickValuesCache.delete(firstKey);
    }
  }
  const frozenTicks = Object.freeze(ticks);
  linearTickValuesCache.set(cacheKey, frozenTicks);
  return frozenTicks;
}
function getNiceStep(step) {
  if (!Number.isFinite(step) || step <= 0) return 1;
  const exponent = Math.floor(Math.log10(step));
  const fraction = step / Math.pow(10, exponent);
  const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : fraction >= 1 ? 1 : 0.5;
  return niceFraction * Math.pow(10, exponent);
}
function roundTick(value, step) {
  const precision = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number(value.toFixed(precision));
}
function getChartGridLineDasharray(lineStyle) {
  if (lineStyle === "dashed") return "4 4";
  if (lineStyle === "dotted") return "1 4";
  return void 0;
}
function clampBarWidth(width, maxWidth) {
  if (maxWidth === void 0 || maxWidth <= 0) return width;
  return Math.min(width, maxWidth);
}
function ensureBarMinHeight(barY, barHeight, baseline, minHeight) {
  if (minHeight <= 0 || barHeight === 0 || barHeight >= minHeight) {
    return { y: barY, height: barHeight };
  }
  if (barY < baseline) {
    return { y: baseline - minHeight, height: minHeight };
  }
  return { y: baseline, height: minHeight };
}
function getBarValueLabelY(barY, barHeight, position, offset2 = 8) {
  if (position === "inside") {
    return barY + barHeight / 2;
  }
  return barY - offset2;
}
function normalizeSvgIdSegment(value) {
  const normalized = value.replace(/[^A-Za-z0-9_-]/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "0";
}
function getStableChartGradientPrefix(kind, instanceId) {
  return `tiger-${kind}-grad-${normalizeSvgIdSegment(instanceId)}`;
}
function getChartElementOpacity(index, activeIndex, options = {}) {
  const { activeOpacity = 1, inactiveOpacity = 0.25, defaultOpacity } = options;
  if (activeIndex === null) {
    return defaultOpacity;
  }
  return index === activeIndex ? activeOpacity : inactiveOpacity;
}
function requestDefaultFrame3(callback) {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback);
  }
  return globalThis.setTimeout(() => callback(globalThis.performance?.now?.() ?? Date.now()), 16);
}
function cancelDefaultFrame3(handle) {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle);
    return;
  }
  globalThis.clearTimeout(handle);
}
function createChartPointerMoveScheduler(options) {
  const requestFrame = options.requestFrame ?? requestDefaultFrame3;
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame3;
  let frameHandle;
  let pendingPosition;
  function applyPending() {
    frameHandle = void 0;
    if (!pendingPosition) return;
    const nextPosition = pendingPosition;
    pendingPosition = void 0;
    options.onPositionChange(nextPosition);
  }
  function cancel() {
    if (frameHandle !== void 0) {
      cancelFrame(frameHandle);
      frameHandle = void 0;
    }
    pendingPosition = void 0;
  }
  function flush() {
    if (frameHandle !== void 0) {
      cancelFrame(frameHandle);
    }
    applyPending();
  }
  function schedule(position) {
    pendingPosition = position;
    if (frameHandle !== void 0) return;
    frameHandle = requestFrame(applyPending);
  }
  return {
    schedule,
    flush,
    cancel,
    isPending: () => frameHandle !== void 0
  };
}
function resolveChartPalette(colors, fallbackColor) {
  if (colors && colors.length > 0) return colors;
  if (fallbackColor) return [fallbackColor];
  return [...DEFAULT_CHART_COLORS];
}
function buildChartLegendItems(options) {
  const { data, palette, activeIndex, getLabel, getColor } = options;
  return data.map((datum, index) => ({
    index,
    label: getLabel(datum, index),
    color: getColor ? getColor(datum, index) : palette[index % palette.length],
    active: activeIndex === null || activeIndex === index
  }));
}
function resolveChartTooltipContent(hoveredIndex, data, formatter, defaultFormatter) {
  if (hoveredIndex === null) return "";
  const datum = data[hoveredIndex];
  if (!datum) return "";
  const fmt = formatter ?? defaultFormatter;
  return fmt(datum, hoveredIndex);
}
function getChartTooltipTransform(position) {
  return `translate3d(${position.x}px, ${position.y}px, 0)`;
}
function defaultXYTooltipFormatter(datum, index) {
  const label = datum.label ?? (datum.x !== void 0 ? String(datum.x) : `#${index + 1}`);
  return `${label}: ${datum.y ?? ""}`;
}
classNames(
  "absolute z-50 mt-1 p-3 rounded-[var(--tiger-radius-md,0.5rem)] shadow-lg",
  "bg-[var(--tiger-colorpicker-panel-bg,var(--tiger-surface,#ffffff))]",
  "border border-[var(--tiger-colorpicker-panel-border,var(--tiger-border,#d1d5db))]"
);
classNames(
  "w-full rounded border px-2 py-1 text-xs font-mono outline-none",
  "bg-[var(--tiger-colorpicker-input-bg,var(--tiger-surface,#ffffff))]",
  "border-[var(--tiger-colorpicker-input-border,var(--tiger-border,#d1d5db))]",
  "text-[var(--tiger-colorpicker-input-text,var(--tiger-text,#111827))]",
  "focus:border-[var(--tiger-colorpicker-input-focus,var(--tiger-primary,#2563eb))]"
);
classNames(
  "overflow-auto relative",
  "bg-[var(--tiger-virtuallist-bg,var(--tiger-surface,#ffffff))]"
);
classNames("flex items-center justify-between mb-3");
classNames(
  "inline-flex items-center justify-center w-7 h-7 rounded transition-colors",
  "text-[var(--tiger-calendar-nav,var(--tiger-text-muted,#6b7280))]",
  "hover:bg-[var(--tiger-calendar-nav-hover-bg,var(--tiger-fill-hover,#e5e7eb))]",
  "cursor-pointer"
);
classNames(
  "text-sm font-semibold",
  "text-[var(--tiger-calendar-title,var(--tiger-text,#111827))]"
);
classNames(
  "text-xs font-medium text-center py-1",
  "text-[var(--tiger-calendar-weekday,var(--tiger-text-muted,#6b7280))]"
);
classNames(
  "absolute z-50 w-48 max-h-48 overflow-auto rounded-[var(--tiger-radius-md,0.5rem)] border shadow-lg",
  "bg-[var(--tiger-mentions-dropdown-bg,var(--tiger-surface,#ffffff))]",
  "border-[var(--tiger-mentions-dropdown-border,var(--tiger-border,#d1d5db))]"
);
classNames(
  "relative inline-flex items-center justify-center",
  "bg-[var(--tiger-qrcode-bg,#ffffff)]",
  "rounded-[var(--tiger-radius-md,0.5rem)]"
);
classNames(
  "absolute inset-0 flex flex-col items-center justify-center",
  "bg-white/80 rounded-[var(--tiger-radius-md,0.5rem)]"
);
classNames(
  "text-sm text-[var(--tiger-qrcode-expired-text,var(--tiger-text-muted,#6b7280))]",
  "mb-1"
);
classNames(
  "text-sm cursor-pointer",
  "text-[var(--tiger-qrcode-refresh,var(--tiger-primary,#2563eb))]",
  "hover:underline"
);
function requestDefaultFrame6(callback) {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback);
  }
  return globalThis.setTimeout(() => callback(globalThis.performance?.now?.() ?? Date.now()), 16);
}
function cancelDefaultFrame6(handle) {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle);
    return;
  }
  globalThis.clearTimeout(handle);
}
function getEntrySize(entry2) {
  const boxSize = Array.isArray(entry2.contentBoxSize) ? entry2.contentBoxSize[0] : entry2.contentBoxSize;
  if (boxSize) {
    return {
      width: boxSize.inlineSize,
      height: boxSize.blockSize
    };
  }
  return {
    width: entry2.contentRect.width,
    height: entry2.contentRect.height
  };
}
function createDefaultResizeObserver2(callback) {
  return new ResizeObserver(callback);
}
function resolveResponsiveChartSize(fallback, observedSize) {
  return {
    width: observedSize && observedSize.width > 0 ? observedSize.width : fallback.width,
    height: observedSize && observedSize.height > 0 ? observedSize.height : fallback.height
  };
}
function createChartResizeObserverController(options) {
  const requestFrame = options.requestFrame ?? requestDefaultFrame6;
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame6;
  const createResizeObserver = options.createResizeObserver ?? createDefaultResizeObserver2;
  let observer;
  let observedTarget;
  let frameHandle;
  let pendingSize;
  function applyPending() {
    frameHandle = void 0;
    if (!pendingSize) return;
    const nextSize = pendingSize;
    pendingSize = void 0;
    options.onSizeChange(nextSize);
  }
  function schedule(size) {
    pendingSize = size;
    if (frameHandle !== void 0) return;
    frameHandle = requestFrame(applyPending);
  }
  function disconnect() {
    observer?.disconnect();
    observer = void 0;
    observedTarget = void 0;
    if (frameHandle !== void 0) {
      cancelFrame(frameHandle);
      frameHandle = void 0;
    }
    pendingSize = void 0;
  }
  function observe(target) {
    if (target === observedTarget && observer) return;
    disconnect();
    observedTarget = target;
    observer = createResizeObserver((entries) => {
      const entry2 = entries.find((item) => item.target === target);
      if (!entry2) return;
      schedule(getEntrySize(entry2));
    });
    observer.observe(target);
  }
  function flush() {
    if (frameHandle !== void 0) {
      cancelFrame(frameHandle);
    }
    applyPending();
  }
  return {
    observe,
    disconnect,
    flush,
    isPending: () => frameHandle !== void 0
  };
}
function resolveSystemDark() {
  return false;
}
var ThemeManagerImpl = class {
  presets = /* @__PURE__ */ new Map();
  currentThemeName = "default";
  colorScheme = "light";
  resolvedDark = false;
  listeners = [];
  mediaQuery = null;
  mediaHandler = null;
  // -----------------------------------------------------------------------
  // Theme registration
  // -----------------------------------------------------------------------
  /** Register a preset theme. Replaces any existing preset with the same name. */
  registerTheme(preset) {
    this.presets.set(preset.name, preset);
  }
  /** Get a registered preset by name. */
  getTheme(name) {
    return this.presets.get(name);
  }
  /** List all registered preset names. */
  getAvailableThemes() {
    return Array.from(this.presets.keys());
  }
  /** Get the currently active theme name. */
  getCurrentTheme() {
    return this.currentThemeName;
  }
  /** Get the resolved (effective) color scheme — always 'light' or 'dark'. */
  getResolvedColorScheme() {
    return this.resolvedDark ? "dark" : "light";
  }
  // -----------------------------------------------------------------------
  // Applying themes
  // -----------------------------------------------------------------------
  /**
   * Switch to a registered preset theme.
   * If the name is not registered the call is a no-op.
   */
  setTheme(name) {
    if (!this.presets.has(name)) {
      console.warn(`[Tigercat] Theme "${name}" is not registered.`);
      return;
    }
    this.currentThemeName = name;
    this.apply();
  }
  /**
   * Define and immediately apply a custom theme at runtime.
   * Registers the theme, then switches to it.
   */
  defineTheme(preset) {
    this.registerTheme(preset);
    this.setTheme(preset.name);
  }
  /**
   * Set the colour scheme strategy.
   * - `'light'` / `'dark'` — force a specific mode
   * - `'auto'` — follow `prefers-color-scheme` media query
   */
  setColorScheme(scheme) {
    this.colorScheme = scheme;
    if (scheme === "auto") {
      this.startWatchingMedia();
      this.resolvedDark = resolveSystemDark();
    } else {
      this.stopWatchingMedia();
      this.resolvedDark = scheme === "dark";
    }
    this.apply();
  }
  /** Get the current color scheme setting (may be 'auto'). */
  getColorScheme() {
    return this.colorScheme;
  }
  // -----------------------------------------------------------------------
  // Listeners
  // -----------------------------------------------------------------------
  /** Subscribe to theme/colour-scheme changes. Returns an unsubscribe function. */
  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------
  apply() {
    return;
  }
  notify() {
    const event = {
      theme: this.currentThemeName,
      colorScheme: this.resolvedDark ? "dark" : "light"
    };
    for (const listener of this.listeners) {
      listener(event);
    }
  }
  startWatchingMedia() {
    return;
  }
  stopWatchingMedia() {
    if (this.mediaQuery && this.mediaHandler) {
      this.mediaQuery.removeEventListener("change", this.mediaHandler);
    }
    this.mediaQuery = null;
    this.mediaHandler = null;
  }
};
var ThemeManager = new ThemeManagerImpl();
var defaultTheme = {
  name: "default",
  label: "Default",
  light: {
    colors: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      primaryActive: "#1e40af",
      primaryDisabled: "#93c5fd",
      secondary: "#4b5563",
      secondaryHover: "#374151",
      secondaryActive: "#1f2937",
      secondaryDisabled: "#9ca3af",
      outlineBgHover: "#eff6ff",
      ghostBgHover: "#eff6ff",
      focusRing: "#2563eb",
      surface: "#ffffff",
      surfaceMuted: "#f9fafb",
      surfaceRaised: "#ffffff",
      text: "#111827",
      textSecondary: "#6b7280",
      textDisabled: "#d1d5db",
      border: "#e5e7eb",
      borderStrong: "#9ca3af",
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      info: "#3b82f6",
      chart1: "#2563eb",
      chart2: "#16a34a",
      chart3: "#d97706",
      chart4: "#a855f7",
      chart5: "#0ea5e9",
      chart6: "#ef4444"
    },
    radius: { sm: "4px", md: "6px", lg: "10px", xl: "14px", none: "0", full: "9999px" },
    shadows: {
      xs: "0 1px 2px 0 rgba(0,0,0,0.05)",
      sm: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
      md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
      lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
    }
  },
  dark: {
    colors: {
      primary: "#60a5fa",
      primaryHover: "#93c5fd",
      primaryActive: "#bfdbfe",
      primaryDisabled: "#1e40af",
      secondary: "#9ca3af",
      secondaryHover: "#d1d5db",
      secondaryActive: "#e5e7eb",
      secondaryDisabled: "#4b5563",
      outlineBgHover: "#1e3a5f",
      ghostBgHover: "#1e3a5f",
      focusRing: "#60a5fa",
      surface: "#111827",
      surfaceMuted: "#1f2937",
      surfaceRaised: "#1f2937",
      text: "#f9fafb",
      textSecondary: "#d1d5db",
      textDisabled: "#4b5563",
      border: "#374151",
      borderStrong: "#6b7280",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#60a5fa",
      chart1: "#60a5fa",
      chart2: "#4ade80",
      chart3: "#fbbf24",
      chart4: "#c084fc",
      chart5: "#38bdf8",
      chart6: "#f87171"
    },
    shadows: {
      xs: "0 1px 2px 0 rgba(0,0,0,0.2)",
      sm: "0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.25)",
      md: "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.25)",
      lg: "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.25)",
      xl: "0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.25)"
    }
  }
};
var vibrantTheme = {
  name: "vibrant",
  label: "Vibrant",
  light: {
    colors: {
      primary: "#8b5cf6",
      primaryHover: "#7c3aed",
      primaryActive: "#6d28d9",
      primaryDisabled: "#c4b5fd",
      secondary: "#ec4899",
      secondaryHover: "#db2777",
      secondaryActive: "#be185d",
      secondaryDisabled: "#f9a8d4",
      outlineBgHover: "#f5f3ff",
      ghostBgHover: "#fdf2f8",
      focusRing: "#8b5cf6",
      surface: "#ffffff",
      surfaceMuted: "#faf5ff",
      surfaceRaised: "#ffffff",
      text: "#1e1b4b",
      textSecondary: "#6b21a8",
      textDisabled: "#c4b5fd",
      border: "#e9d5ff",
      borderStrong: "#a78bfa",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#06b6d4",
      chart1: "#8b5cf6",
      chart2: "#ec4899",
      chart3: "#f59e0b",
      chart4: "#06b6d4",
      chart5: "#10b981",
      chart6: "#f43f5e"
    },
    radius: { sm: "6px", md: "10px", lg: "14px", xl: "18px", none: "0", full: "9999px" }
  },
  dark: {
    colors: {
      primary: "#a78bfa",
      primaryHover: "#c4b5fd",
      primaryActive: "#ddd6fe",
      primaryDisabled: "#4c1d95",
      secondary: "#f472b6",
      secondaryHover: "#f9a8d4",
      secondaryActive: "#fbcfe8",
      secondaryDisabled: "#831843",
      outlineBgHover: "#2e1065",
      ghostBgHover: "#500724",
      focusRing: "#a78bfa",
      surface: "#0f0a1e",
      surfaceMuted: "#1a1035",
      surfaceRaised: "#231848",
      text: "#f5f3ff",
      textSecondary: "#c4b5fd",
      textDisabled: "#4c1d95",
      border: "#3b2070",
      borderStrong: "#7c3aed",
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#22d3ee",
      chart1: "#a78bfa",
      chart2: "#f472b6",
      chart3: "#fbbf24",
      chart4: "#22d3ee",
      chart5: "#34d399",
      chart6: "#fb7185"
    }
  }
};
var professionalTheme = {
  name: "professional",
  label: "Professional",
  light: {
    colors: {
      primary: "#1e40af",
      primaryHover: "#1e3a8a",
      primaryActive: "#172554",
      primaryDisabled: "#93c5fd",
      secondary: "#334155",
      secondaryHover: "#1e293b",
      secondaryActive: "#0f172a",
      secondaryDisabled: "#94a3b8",
      outlineBgHover: "#eff6ff",
      ghostBgHover: "#f1f5f9",
      focusRing: "#1e40af",
      surface: "#ffffff",
      surfaceMuted: "#f8fafc",
      surfaceRaised: "#ffffff",
      text: "#0f172a",
      textSecondary: "#475569",
      textDisabled: "#cbd5e1",
      border: "#e2e8f0",
      borderStrong: "#94a3b8",
      success: "#15803d",
      warning: "#b45309",
      error: "#b91c1c",
      info: "#1d4ed8",
      chart1: "#1e40af",
      chart2: "#15803d",
      chart3: "#b45309",
      chart4: "#7e22ce",
      chart5: "#0e7490",
      chart6: "#b91c1c"
    },
    radius: { sm: "2px", md: "4px", lg: "8px", xl: "10px", none: "0", full: "9999px" },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontFamilyMono: "'JetBrains Mono', 'SF Mono', monospace",
      fontSizeBase: "15px",
      fontSizeSm: "13px",
      fontSizeLg: "17px",
      fontWeightNormal: "400",
      fontWeightMedium: "500",
      fontWeightSemibold: "600",
      fontWeightBold: "700",
      lineHeightNormal: "1.5",
      lineHeightTight: "1.25"
    }
  },
  dark: {
    colors: {
      primary: "#60a5fa",
      primaryHover: "#93c5fd",
      primaryActive: "#bfdbfe",
      primaryDisabled: "#1e3a8a",
      secondary: "#94a3b8",
      secondaryHover: "#cbd5e1",
      secondaryActive: "#e2e8f0",
      secondaryDisabled: "#334155",
      outlineBgHover: "#172554",
      ghostBgHover: "#1e293b",
      focusRing: "#60a5fa",
      surface: "#0f172a",
      surfaceMuted: "#1e293b",
      surfaceRaised: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#cbd5e1",
      textDisabled: "#475569",
      border: "#334155",
      borderStrong: "#64748b",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#60a5fa",
      chart1: "#60a5fa",
      chart2: "#4ade80",
      chart3: "#fbbf24",
      chart4: "#c084fc",
      chart5: "#22d3ee",
      chart6: "#f87171"
    }
  }
};
var minimalTheme = {
  name: "minimal",
  label: "Minimal",
  light: {
    colors: {
      primary: "#18181b",
      primaryHover: "#09090b",
      primaryActive: "#000000",
      primaryDisabled: "#a1a1aa",
      secondary: "#52525b",
      secondaryHover: "#3f3f46",
      secondaryActive: "#27272a",
      secondaryDisabled: "#a1a1aa",
      outlineBgHover: "#fafafa",
      ghostBgHover: "#f4f4f5",
      focusRing: "#18181b",
      surface: "#ffffff",
      surfaceMuted: "#fafafa",
      surfaceRaised: "#ffffff",
      text: "#09090b",
      textSecondary: "#71717a",
      textDisabled: "#d4d4d8",
      border: "#e4e4e7",
      borderStrong: "#a1a1aa",
      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
      info: "#18181b",
      chart1: "#18181b",
      chart2: "#71717a",
      chart3: "#a1a1aa",
      chart4: "#d4d4d8",
      chart5: "#3f3f46",
      chart6: "#52525b"
    },
    radius: { sm: "2px", md: "4px", lg: "6px", xl: "8px", none: "0", full: "9999px" },
    shadows: {
      xs: "0 1px 2px 0 rgba(0,0,0,0.03)",
      sm: "0 1px 2px 0 rgba(0,0,0,0.06)",
      md: "0 2px 4px -1px rgba(0,0,0,0.06)",
      lg: "0 4px 6px -2px rgba(0,0,0,0.06)",
      xl: "0 8px 16px -4px rgba(0,0,0,0.08)"
    }
  },
  dark: {
    colors: {
      primary: "#fafafa",
      primaryHover: "#e4e4e7",
      primaryActive: "#d4d4d8",
      primaryDisabled: "#3f3f46",
      secondary: "#a1a1aa",
      secondaryHover: "#d4d4d8",
      secondaryActive: "#e4e4e7",
      secondaryDisabled: "#3f3f46",
      outlineBgHover: "#27272a",
      ghostBgHover: "#27272a",
      focusRing: "#fafafa",
      surface: "#09090b",
      surfaceMuted: "#18181b",
      surfaceRaised: "#27272a",
      text: "#fafafa",
      textSecondary: "#a1a1aa",
      textDisabled: "#3f3f46",
      border: "#27272a",
      borderStrong: "#52525b",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#fafafa",
      chart1: "#fafafa",
      chart2: "#a1a1aa",
      chart3: "#71717a",
      chart4: "#52525b",
      chart5: "#d4d4d8",
      chart6: "#e4e4e7"
    },
    shadows: {
      xs: "0 1px 2px 0 rgba(0,0,0,0.3)",
      sm: "0 1px 2px 0 rgba(0,0,0,0.4)",
      md: "0 2px 4px -1px rgba(0,0,0,0.4)",
      lg: "0 4px 6px -2px rgba(0,0,0,0.4)",
      xl: "0 8px 16px -4px rgba(0,0,0,0.5)"
    }
  }
};
var naturalTheme = {
  name: "natural",
  label: "Natural",
  light: {
    colors: {
      primary: "#059669",
      primaryHover: "#047857",
      primaryActive: "#065f46",
      primaryDisabled: "#6ee7b7",
      secondary: "#78716c",
      secondaryHover: "#57534e",
      secondaryActive: "#44403c",
      secondaryDisabled: "#a8a29e",
      outlineBgHover: "#ecfdf5",
      ghostBgHover: "#f5f5f4",
      focusRing: "#059669",
      surface: "#fffbf5",
      surfaceMuted: "#faf5ee",
      surfaceRaised: "#ffffff",
      text: "#1c1917",
      textSecondary: "#57534e",
      textDisabled: "#d6d3d1",
      border: "#e7e5e4",
      borderStrong: "#a8a29e",
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      info: "#0284c7",
      chart1: "#059669",
      chart2: "#d97706",
      chart3: "#0284c7",
      chart4: "#a16207",
      chart5: "#0d9488",
      chart6: "#be123c"
    },
    radius: { sm: "6px", md: "8px", lg: "12px", xl: "16px", none: "0", full: "9999px" },
    typography: {
      fontFamily: "'Source Sans 3', 'Georgia', -apple-system, sans-serif",
      fontFamilyMono: "'Source Code Pro', 'Menlo', monospace",
      fontSizeBase: "16px",
      fontSizeSm: "14px",
      fontSizeLg: "18px",
      fontWeightNormal: "400",
      fontWeightMedium: "500",
      fontWeightSemibold: "600",
      fontWeightBold: "700",
      lineHeightNormal: "1.6",
      lineHeightTight: "1.3"
    }
  },
  dark: {
    colors: {
      primary: "#34d399",
      primaryHover: "#6ee7b7",
      primaryActive: "#a7f3d0",
      primaryDisabled: "#064e3b",
      secondary: "#a8a29e",
      secondaryHover: "#d6d3d1",
      secondaryActive: "#e7e5e4",
      secondaryDisabled: "#44403c",
      outlineBgHover: "#064e3b",
      ghostBgHover: "#292524",
      focusRing: "#34d399",
      surface: "#1c1917",
      surfaceMuted: "#292524",
      surfaceRaised: "#292524",
      text: "#fafaf9",
      textSecondary: "#d6d3d1",
      textDisabled: "#44403c",
      border: "#44403c",
      borderStrong: "#78716c",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#38bdf8",
      chart1: "#34d399",
      chart2: "#fbbf24",
      chart3: "#38bdf8",
      chart4: "#fcd34d",
      chart5: "#2dd4bf",
      chart6: "#fb7185"
    }
  }
};
var modernTheme = {
  name: "modern",
  label: "Modern",
  light: {
    colors: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      primaryActive: "#1e40af",
      primaryDisabled: "#93c5fd",
      secondary: "#4b5563",
      secondaryHover: "#374151",
      secondaryActive: "#1f2937",
      secondaryDisabled: "#9ca3af",
      outlineBgHover: "#eff6ff",
      ghostBgHover: "#eff6ff",
      focusRing: "#2563eb",
      surface: "#ffffff",
      surfaceMuted: "#f8fafc",
      surfaceRaised: "#ffffff",
      text: "#0f172a",
      textSecondary: "#475569",
      textDisabled: "#cbd5e1",
      border: "#e2e8f0",
      borderStrong: "#94a3b8",
      success: "#16a34a",
      warning: "#d97706",
      error: "#dc2626",
      info: "#0ea5e9",
      chart1: "#2563eb",
      chart2: "#16a34a",
      chart3: "#d97706",
      chart4: "#a855f7",
      chart5: "#0ea5e9",
      chart6: "#ef4444"
    },
    radius: { none: "0", sm: "8px", md: "12px", lg: "16px", xl: "20px", full: "9999px" },
    shadows: {
      xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      md: "0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -1px rgb(0 0 0 / 0.04)",
      lg: "0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)",
      xl: "0 24px 48px -8px rgb(0 0 0 / 0.1), 0 8px 16px -4px rgb(0 0 0 / 0.05)"
    },
    motion: {
      durationFast: "150ms",
      durationBase: "200ms",
      durationSlow: "300ms",
      easing: "cubic-bezier(0.2, 0, 0, 1)"
    }
  },
  dark: {
    colors: {
      primary: "#60a5fa",
      primaryHover: "#93c5fd",
      primaryActive: "#bfdbfe",
      primaryDisabled: "#1e40af",
      secondary: "#94a3b8",
      secondaryHover: "#cbd5e1",
      secondaryActive: "#e2e8f0",
      secondaryDisabled: "#475569",
      outlineBgHover: "#1e3a5f",
      ghostBgHover: "#1e3a5f",
      focusRing: "#60a5fa",
      surface: "#0f172a",
      surfaceMuted: "#1e293b",
      surfaceRaised: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#cbd5e1",
      textDisabled: "#475569",
      border: "#334155",
      borderStrong: "#64748b",
      success: "#4ade80",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#38bdf8",
      chart1: "#60a5fa",
      chart2: "#4ade80",
      chart3: "#fbbf24",
      chart4: "#c084fc",
      chart5: "#38bdf8",
      chart6: "#f87171"
    },
    shadows: {
      xs: "0 1px 2px 0 rgb(2 6 23 / 0.4)",
      sm: "0 1px 2px 0 rgb(2 6 23 / 0.5)",
      md: "0 4px 8px -2px rgb(2 6 23 / 0.55), 0 2px 4px -1px rgb(2 6 23 / 0.4)",
      lg: "0 12px 24px -4px rgb(2 6 23 / 0.55), 0 4px 8px -2px rgb(2 6 23 / 0.4)",
      xl: "0 24px 48px -8px rgb(2 6 23 / 0.6), 0 8px 16px -4px rgb(2 6 23 / 0.45)"
    }
  }
};
var highContrastTheme = {
  name: "high-contrast",
  label: "High Contrast",
  light: {
    colors: {
      primary: "#0033cc",
      primaryHover: "#002699",
      primaryActive: "#001f80",
      primaryDisabled: "#7f8fcf",
      secondary: "#000000",
      secondaryHover: "#1f1f1f",
      secondaryActive: "#333333",
      secondaryDisabled: "#767676",
      outlineBgHover: "#e6eeff",
      ghostBgHover: "#f2f2f2",
      focusRing: "#000000",
      surface: "#ffffff",
      surfaceMuted: "#f2f2f2",
      surfaceRaised: "#ffffff",
      text: "#000000",
      textSecondary: "#000000",
      textDisabled: "#595959",
      border: "#000000",
      borderStrong: "#000000",
      success: "#006400",
      warning: "#7a4b00",
      error: "#b00020",
      info: "#0033cc",
      chart1: "#0033cc",
      chart2: "#006400",
      chart3: "#7a4b00",
      chart4: "#6b00b9",
      chart5: "#005f73",
      chart6: "#b00020"
    },
    radius: { sm: "2px", md: "4px", lg: "6px", xl: "8px", none: "0", full: "9999px" },
    shadows: {
      xs: "0 0 0 1px #000000",
      sm: "0 0 0 1px #000000",
      md: "0 0 0 2px #000000",
      lg: "0 0 0 2px #000000",
      xl: "0 0 0 3px #000000"
    }
  },
  dark: {
    colors: {
      primary: "#66b2ff",
      primaryHover: "#99ccff",
      primaryActive: "#cce5ff",
      primaryDisabled: "#335c85",
      secondary: "#ffffff",
      secondaryHover: "#e6e6e6",
      secondaryActive: "#cccccc",
      secondaryDisabled: "#8c8c8c",
      outlineBgHover: "#001f3f",
      ghostBgHover: "#1a1a1a",
      focusRing: "#ffff00",
      surface: "#000000",
      surfaceMuted: "#111111",
      surfaceRaised: "#000000",
      text: "#ffffff",
      textSecondary: "#ffffff",
      textDisabled: "#a6a6a6",
      border: "#ffffff",
      borderStrong: "#ffffff",
      success: "#00e676",
      warning: "#ffd54f",
      error: "#ff8a80",
      info: "#80d8ff",
      chart1: "#66b2ff",
      chart2: "#00e676",
      chart3: "#ffd54f",
      chart4: "#d7a5ff",
      chart5: "#80d8ff",
      chart6: "#ff8a80"
    },
    shadows: {
      xs: "0 0 0 1px #ffffff",
      sm: "0 0 0 1px #ffffff",
      md: "0 0 0 2px #ffffff",
      lg: "0 0 0 2px #ffffff",
      xl: "0 0 0 3px #ffffff"
    }
  }
};
var builtInPresets = [
  defaultTheme,
  vibrantTheme,
  professionalTheme,
  minimalTheme,
  naturalTheme,
  modernTheme,
  highContrastTheme
];
for (const preset of builtInPresets) {
  ThemeManager.registerTheme(preset);
}
function unref(value) {
  return value?.value !== void 0 ? value.value : value;
}
function useChartInteraction(options) {
  const { emit, getData, eventNames } = options;
  const localHoveredIndex = ref(null);
  const localSelectedIndex = ref(null);
  const tooltipPosition = ref({ x: 0, y: 0 });
  const tooltipScheduler = createChartPointerMoveScheduler({
    onPositionChange: (position) => {
      tooltipPosition.value = position;
    }
  });
  if (getCurrentScope()) {
    onScopeDispose(() => tooltipScheduler.cancel());
  }
  const resolvedHoveredIndex = computed(() => {
    const prop = options.hoveredIndexProp?.();
    return prop !== void 0 ? prop : localHoveredIndex.value;
  });
  const resolvedSelectedIndex = computed(() => {
    const prop = options.selectedIndexProp?.();
    return prop !== void 0 ? prop : localSelectedIndex.value;
  });
  const activeIndex = computed(() => {
    if (resolvedSelectedIndex.value !== null) return resolvedSelectedIndex.value;
    if (unref(options.hoverable) && resolvedHoveredIndex.value !== null) {
      return resolvedHoveredIndex.value;
    }
    return null;
  });
  const getElementOpacity = (index) => {
    return getChartElementOpacity(index, activeIndex.value, {
      activeOpacity: unref(options.activeOpacity),
      inactiveOpacity: unref(options.inactiveOpacity)
    });
  };
  const handleMouseEnter = (index, event) => {
    if (!unref(options.hoverable)) return;
    if (options.hoveredIndexProp?.() === void 0) {
      localHoveredIndex.value = index;
    }
    tooltipPosition.value = { x: event.clientX, y: event.clientY };
    emit("update:hoveredIndex", index);
    if (eventNames?.hover && getData) {
      emit(eventNames.hover, index, getData(index));
    }
  };
  const handleMouseMove = (event) => {
    tooltipScheduler.schedule({ x: event.clientX, y: event.clientY });
  };
  const handleMouseLeave = () => {
    tooltipScheduler.cancel();
    if (!unref(options.hoverable)) return;
    if (options.hoveredIndexProp?.() === void 0) {
      localHoveredIndex.value = null;
    }
    emit("update:hoveredIndex", null);
    if (eventNames?.hover) {
      emit(eventNames.hover, null, null);
    }
  };
  const handleClick = (index) => {
    if (!unref(options.selectable)) return;
    const nextIndex = resolvedSelectedIndex.value === index ? null : index;
    if (options.selectedIndexProp?.() === void 0) {
      localSelectedIndex.value = nextIndex;
    }
    emit("update:selectedIndex", nextIndex);
    if (eventNames?.click && getData) {
      emit(eventNames.click, index, getData(index));
    }
  };
  const handleKeyDown = (event, index) => {
    if (!unref(options.selectable)) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleClick(index);
  };
  const handleLegendClick = (index) => {
    handleClick(index);
  };
  const handleLegendHover = (index) => {
    if (!unref(options.hoverable)) return;
    if (options.hoveredIndexProp?.() === void 0) {
      localHoveredIndex.value = index;
    }
    emit("update:hoveredIndex", index);
  };
  const handleLegendLeave = () => {
    handleMouseLeave();
  };
  const wrapperClasses = computed(() => {
    const position = unref(options.legendPosition) ?? "bottom";
    return classNames(
      "inline-flex",
      position === "right" ? "flex-row items-start gap-4" : position === "left" ? "flex-row-reverse items-start gap-4" : position === "top" ? "flex-col-reverse gap-2" : "flex-col gap-2"
    );
  });
  const createLegendItems = (items, palette, labelFormatter) => {
    return items.map((item, index) => ({
      index,
      label: labelFormatter ? labelFormatter(item, index) : item.label ?? String(item.x ?? index),
      color: item.color ?? palette[index % palette.length],
      active: activeIndex.value === null || activeIndex.value === index
    }));
  };
  return {
    localHoveredIndex,
    localSelectedIndex,
    tooltipPosition,
    resolvedHoveredIndex,
    resolvedSelectedIndex,
    activeIndex,
    getElementOpacity,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave,
    wrapperClasses,
    createLegendItems
  };
}
var ChartLegend = defineComponent({
  name: "TigerChartLegend",
  props: {
    items: {
      type: Array,
      required: true
    },
    position: {
      type: String,
      default: "bottom"
    },
    markerSize: {
      type: Number,
      default: 10
    },
    gap: {
      type: Number,
      default: 8
    },
    interactive: {
      type: Boolean,
      default: false
    },
    className: {
      type: String
    }
  },
  emits: ["item-click", "item-hover", "item-leave"],
  setup(props, { emit }) {
    const containerClasses = computed(
      () => classNames(
        "flex flex-wrap",
        props.position === "right" || props.position === "left" ? "flex-col" : "flex-row",
        props.className
      )
    );
    const containerStyle = computed(() => ({
      gap: `${props.gap}px`
    }));
    const handleClick = (item) => {
      if (!props.interactive) return;
      emit("item-click", item.index, item);
    };
    const handleHover = (item) => {
      if (!props.interactive) return;
      emit("item-hover", item.index, item);
    };
    const handleLeave = () => {
      if (!props.interactive) return;
      emit("item-leave");
    };
    return () => h(
      "div",
      {
        class: containerClasses.value,
        style: containerStyle.value,
        role: "list",
        "aria-label": "Chart legend",
        "data-chart-legend": "true"
      },
      props.items.map(
        (item) => h(
          props.interactive ? "button" : "div",
          {
            key: `legend-${item.index}`,
            type: props.interactive ? "button" : void 0,
            class: classNames(
              "flex items-center gap-2 text-sm rounded-[var(--tiger-chart-legend-row-radius,0)]",
              "text-[color:var(--tiger-text-secondary,#6b7280)]",
              props.interactive ? "cursor-pointer hover:text-[color:var(--tiger-text,#374151)] hover:bg-[var(--tiger-chart-legend-row-hover-bg,transparent)] transition-colors" : "cursor-default",
              item.active === false ? "opacity-50" : void 0
            ),
            role: "listitem",
            "data-legend-item": "true",
            onClick: props.interactive ? () => handleClick(item) : void 0,
            onMouseenter: props.interactive ? () => handleHover(item) : void 0,
            onMouseleave: props.interactive ? handleLeave : void 0
          },
          [
            h("span", {
              class: "inline-block rounded-full shrink-0",
              style: {
                width: `${props.markerSize}px`,
                height: `${props.markerSize}px`,
                background: `var(--tiger-chart-legend-marker-image, ${item.color})`,
                "--tiger-chart-legend-marker-color": item.color
              },
              "aria-hidden": "true",
              "data-legend-marker": "true"
            }),
            h("span", { style: { marginRight: `${props.gap}px` } }, item.label)
          ]
        )
      )
    );
  }
});
var ChartSeries = defineComponent({
  name: "TigerChartSeries",
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      required: true
    },
    name: {
      type: String
    },
    color: {
      type: String
    },
    opacity: {
      type: Number
    },
    type: {
      type: String
    },
    className: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    return () => h(
      "g",
      {
        ...attrs,
        class: classNames(coerceClassValue(attrs.class), props.className),
        "data-series-name": props.name,
        "data-series-type": props.type,
        fill: props.color,
        stroke: props.color,
        opacity: props.opacity
      },
      slots.default?.({
        data: props.data,
        name: props.name,
        color: props.color,
        opacity: props.opacity,
        type: props.type
      })
    );
  }
});
var ChartTooltip = defineComponent({
  name: "TigerChartTooltip",
  props: {
    content: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    className: {
      type: String
    }
  },
  setup(props) {
    const tooltipRef = ref(null);
    const adjustedPosition = ref({ x: props.x, y: props.y });
    watch(
      () => [props.x, props.y, props.visible],
      (_value, _oldValue, onCleanup) => {
        if (!props.visible) return;
        let x = props.x + 12;
        let y = props.y - 8;
        const frameHandle = requestAnimationFrame(() => {
          if (!tooltipRef.value) return;
          const rect = tooltipRef.value.getBoundingClientRect();
          const viewportWidth = (void 0).innerWidth;
          const viewportHeight = (void 0).innerHeight;
          if (x + rect.width > viewportWidth - 8) {
            x = props.x - rect.width - 12;
          }
          if (y + rect.height > viewportHeight - 8) {
            y = props.y - rect.height - 8;
          }
          x = Math.max(8, x);
          y = Math.max(8, y);
          adjustedPosition.value = { x, y };
        });
        onCleanup(() => cancelAnimationFrame(frameHandle));
        adjustedPosition.value = { x, y };
      },
      { immediate: true }
    );
    const tooltipClasses = computed(
      () => classNames(
        "fixed left-0 top-0 z-[9999] pointer-events-none will-change-transform",
        "px-3 py-2 rounded-[var(--tiger-radius-md,0.375rem)] shadow-[var(--tiger-shadow-glass,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]",
        "bg-[color:var(--tiger-bg-elevated,#1f2937)]",
        "text-[color:var(--tiger-text-inverse,#f9fafb)]",
        "text-sm whitespace-nowrap",
        "transition-opacity duration-150",
        props.visible ? "opacity-100" : "opacity-0",
        props.className
      )
    );
    return () => {
      if (!props.content) return null;
      return h(Teleport, { to: "body" }, [
        h(
          "div",
          {
            ref: tooltipRef,
            class: tooltipClasses.value,
            style: {
              transform: getChartTooltipTransform(adjustedPosition.value)
            },
            role: "tooltip",
            "data-chart-tooltip": "true"
          },
          props.content
        )
      ]);
    };
  }
});
var ChartCanvas = defineComponent({
  name: "TigerChartCanvas",
  inheritAttrs: false,
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 200
    },
    responsive: {
      type: Boolean,
      default: false
    },
    padding: {
      type: [Number, Object],
      default: 24
    },
    className: {
      type: String
    },
    title: {
      type: String
    },
    desc: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    const svgRef = ref(null);
    const observedSize = ref(null);
    const resizeController = createChartResizeObserverController({
      onSizeChange: (size) => {
        observedSize.value = size;
      }
    });
    const resolvedSize = computed(
      () => resolveResponsiveChartSize(
        { width: props.width, height: props.height },
        props.responsive ? observedSize.value : null
      )
    );
    const innerRect = computed(
      () => getChartInnerRect(resolvedSize.value.width, resolvedSize.value.height, props.padding)
    );
    const svgClasses = computed(
      () => classNames(chartCanvasBaseClasses, coerceClassValue(attrs.class), props.className)
    );
    const svgStyle = computed(() => ({
      ...attrs.style
    }));
    const syncResponsiveObserver = () => {
      if (!props.responsive) {
        resizeController.disconnect();
        observedSize.value = null;
        return;
      }
      const target = svgRef.value?.parentElement;
      if (target) {
        resizeController.observe(target);
      }
    };
    watch(() => props.responsive, syncResponsiveObserver);
    return () => {
      const rect = innerRect.value;
      const size = resolvedSize.value;
      return h(
        "svg",
        {
          ...attrs,
          ref: svgRef,
          width: size.width,
          height: size.height,
          viewBox: `0 0 ${size.width} ${size.height}`,
          class: svgClasses.value,
          style: svgStyle.value
        },
        [
          props.title ? h("title", props.title) : null,
          props.desc ? h("desc", props.desc) : null,
          h(
            "g",
            {
              transform: `translate(${rect.x}, ${rect.y})`
            },
            slots.default?.({ innerRect: rect })
          )
        ].filter(Boolean)
      );
    };
  }
});
var TigerConfigKey = /* @__PURE__ */ Symbol("TigerConfig");
function useTigerConfig() {
  return inject(
    TigerConfigKey,
    computed(() => ({}))
  );
}
var ConfigProvider = defineComponent({
  name: "TigerConfigProvider",
  props: {
    locale: {
      type: [Object, Function, Promise],
      default: void 0
    },
    direction: {
      type: String,
      default: void 0
    },
    theme: {
      type: String,
      default: void 0
    },
    colorScheme: {
      type: String,
      default: void 0
    }
  },
  setup(props, { slots }) {
    const parent = useTigerConfig();
    const resolvedLocale = ref(
      isLazyTigerLocale(props.locale) ? void 0 : getImmediateTigerLocale(props.locale)
    );
    const localeLoading = ref(isLazyTigerLocale(props.locale));
    let loadId = 0;
    watch(
      () => props.locale,
      (locale) => {
        if (!isLazyTigerLocale(locale)) {
          resolvedLocale.value = getImmediateTigerLocale(locale);
          localeLoading.value = false;
          return;
        }
        const thisId = ++loadId;
        localeLoading.value = true;
        resolveTigerLocale(locale).then(
          (result) => {
            if (thisId === loadId) {
              resolvedLocale.value = result;
              localeLoading.value = false;
            }
          },
          () => {
            if (thisId === loadId) {
              localeLoading.value = false;
            }
          }
        );
      },
      { immediate: true }
    );
    const merged = computed(() => {
      return {
        locale: mergeTigerLocale(parent.value.locale, resolvedLocale.value),
        localeLoading: localeLoading.value || parent.value.localeLoading,
        direction: props.direction ?? resolvedLocale.value?.direction ?? parent.value.direction ?? (resolvedLocale.value?.locale ? getLocaleDirection(resolvedLocale.value) : void 0),
        theme: props.theme ?? parent.value.theme,
        colorScheme: props.colorScheme ?? parent.value.colorScheme
      };
    });
    watch(
      () => merged.value.theme,
      (name) => {
        if (name) ThemeManager.setTheme(name);
      },
      { immediate: true }
    );
    watch(
      () => merged.value.colorScheme,
      (scheme) => {
        if (scheme) ThemeManager.setColorScheme(scheme);
      },
      { immediate: true }
    );
    watch(
      () => merged.value.direction,
      (direction) => {
        return;
      },
      { immediate: true }
    );
    provide(TigerConfigKey, merged);
    return () => slots.default?.();
  }
});
function createFilledIcon(path, className) {
  return h(
    "svg",
    {
      class: className,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: icon20ViewBox,
      fill: "currentColor"
    },
    [
      h("path", {
        "fill-rule": "evenodd",
        d: path,
        "clip-rule": "evenodd"
      })
    ]
  );
}
var ChartAxis = defineComponent({
  name: "TigerChartAxis",
  inheritAttrs: false,
  props: {
    orientation: {
      type: String,
      default: "bottom"
    },
    scale: {
      type: Object,
      required: true
    },
    ticks: {
      type: Number,
      default: 5
    },
    tickValues: {
      type: Array
    },
    tickFormat: {
      type: Function
    },
    tickSize: {
      type: Number,
      default: 6
    },
    tickPadding: {
      type: Number,
      default: 4
    },
    label: {
      type: String
    },
    labelOffset: {
      type: Number,
      default: 28
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    className: {
      type: String
    }
  },
  setup(props, { attrs }) {
    const ticks = computed(
      () => getChartAxisTicks(props.scale, {
        tickCount: props.ticks,
        tickValues: props.tickValues,
        tickFormat: props.tickFormat
      })
    );
    const axisClasses = computed(() => classNames(coerceClassValue(attrs.class), props.className));
    return () => {
      const isHorizontal = props.orientation === "top" || props.orientation === "bottom";
      const isTopOrLeft = props.orientation === "top" || props.orientation === "left";
      const rangeStart = props.scale.range[0];
      const rangeEnd = props.scale.range[1];
      const axisLine = isHorizontal ? { x1: rangeStart, y1: 0, x2: rangeEnd, y2: 0 } : { x1: 0, y1: rangeStart, x2: 0, y2: rangeEnd };
      const tickDirection = isTopOrLeft ? -1 : 1;
      const labelBase = props.tickSize + props.tickPadding + props.labelOffset;
      const labelPosition = (rangeStart + rangeEnd) / 2;
      return h(
        "g",
        {
          ...attrs,
          class: axisClasses.value,
          transform: `translate(${props.x}, ${props.y})`
        },
        [
          h("line", {
            ...axisLine,
            class: chartAxisLineClasses,
            "data-axis-line": "true"
          }),
          ...ticks.value.map((tick) => {
            const tickLine = isHorizontal ? {
              x1: tick.position,
              y1: 0,
              x2: tick.position,
              y2: props.tickSize * tickDirection
            } : {
              x1: 0,
              y1: tick.position,
              x2: props.tickSize * tickDirection,
              y2: tick.position
            };
            const textProps = isHorizontal ? {
              x: tick.position,
              y: props.tickSize * tickDirection + props.tickPadding * tickDirection,
              "text-anchor": "middle",
              dy: isTopOrLeft ? "-0.32em" : "0.71em"
            } : {
              x: (props.tickSize + props.tickPadding) * tickDirection,
              y: tick.position,
              "text-anchor": isTopOrLeft ? "end" : "start",
              dy: "0.32em"
            };
            return h("g", { "data-axis-tick": "true" }, [
              h("line", {
                ...tickLine,
                class: chartAxisTickLineClasses
              }),
              h(
                "text",
                {
                  ...textProps,
                  class: chartAxisTickTextClasses
                },
                tick.label
              )
            ]);
          }),
          props.label ? h(
            "text",
            {
              class: chartAxisLabelClasses,
              "data-axis-label": "true",
              ...isHorizontal ? {
                x: labelPosition,
                y: labelBase * tickDirection,
                "text-anchor": "middle",
                dy: isTopOrLeft ? "-0.32em" : "0.71em"
              } : {
                x: labelBase * tickDirection,
                y: labelPosition,
                "text-anchor": "middle",
                transform: `rotate(${isTopOrLeft ? -90 : 90} ${labelBase * tickDirection} ${labelPosition})`
              }
            },
            props.label
          ) : null
        ]
      );
    };
  }
});
var ChartGrid = defineComponent({
  name: "TigerChartGrid",
  inheritAttrs: false,
  props: {
    xScale: {
      type: Object
    },
    yScale: {
      type: Object
    },
    show: {
      type: String,
      default: "both"
    },
    xTicks: {
      type: Number,
      default: 5
    },
    yTicks: {
      type: Number,
      default: 5
    },
    xTickValues: {
      type: Array
    },
    yTickValues: {
      type: Array
    },
    lineStyle: {
      type: String,
      default: "solid"
    },
    strokeWidth: {
      type: Number,
      default: 1
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    className: {
      type: String
    }
  },
  setup(props, { attrs }) {
    const dasharray = computed(() => getChartGridLineDasharray(props.lineStyle));
    const xTicks = computed(() => {
      if (!props.xScale) return [];
      return getChartAxisTicks(props.xScale, {
        tickCount: props.xTicks,
        tickValues: props.xTickValues
      });
    });
    const yTicks = computed(() => {
      if (!props.yScale) return [];
      return getChartAxisTicks(props.yScale, {
        tickCount: props.yTicks,
        tickValues: props.yTickValues
      });
    });
    const gridClasses = computed(() => classNames(coerceClassValue(attrs.class), props.className));
    return () => {
      const shouldRenderX = props.show === "both" || props.show === "x";
      const shouldRenderY = props.show === "both" || props.show === "y";
      const xRange = props.xScale?.range;
      const yRange = props.yScale?.range;
      const lines = [];
      if (shouldRenderX && props.xScale && yRange) {
        xTicks.value.forEach((tick) => {
          lines.push(
            h("line", {
              x1: tick.position,
              y1: yRange[0],
              x2: tick.position,
              y2: yRange[1],
              class: chartGridLineClasses,
              "stroke-width": props.strokeWidth,
              "stroke-dasharray": dasharray.value
            })
          );
        });
      }
      if (shouldRenderY && props.yScale && xRange) {
        yTicks.value.forEach((tick) => {
          lines.push(
            h("line", {
              x1: xRange[0],
              y1: tick.position,
              x2: xRange[1],
              y2: tick.position,
              class: chartGridLineClasses,
              "stroke-width": props.strokeWidth,
              "stroke-dasharray": dasharray.value
            })
          );
        });
      }
      return h(
        "g",
        {
          ...attrs,
          class: gridClasses.value,
          transform: `translate(${props.x}, ${props.y})`
        },
        lines
      );
    };
  }
});
var createLoadingSpinner = () => {
  const spinnerSvg = getSpinnerSVG("spinner");
  return h(
    "svg",
    {
      class: "animate-spin h-4 w-4",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: spinnerSvg.viewBox,
      "aria-hidden": "true",
      focusable: "false"
    },
    spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  );
};
var Button = defineComponent({
  name: "TigerButton",
  inheritAttrs: false,
  props: {
    /**
     * Button variant style
     * @default 'primary'
     */
    variant: {
      type: String,
      default: "primary"
    },
    /**
     * Button size
     * @default 'md'
     */
    size: {
      type: String,
      default: "md"
    },
    /**
     * Whether the button is disabled
     */
    disabled: Boolean,
    /**
     * Whether the button is in loading state
     */
    loading: Boolean,
    /**
     * Whether the button should take full width of its parent
     */
    block: Boolean,
    /**
     * Icon position relative to button text
     * @default 'left'
     */
    iconPosition: {
      type: String,
      default: "left"
    },
    /**
     * HTML button type
     * @default 'button'
     */
    htmlType: {
      type: String,
      default: "button"
    },
    /**
     * Whether to apply danger/destructive styling
     */
    danger: Boolean,
    className: {
      type: String,
      default: void 0
    },
    style: {
      type: Object,
      default: void 0
    }
  },
  emits: ["click"],
  setup(props, { slots, emit, attrs }) {
    const buttonClasses = computed(() => {
      const variantClasses = props.danger ? buttonDangerClasses[props.variant] ?? buttonDangerClasses.primary : getButtonVariantClasses(props.variant);
      return composeComponentClasses(
        buttonBaseClasses,
        variantClasses,
        buttonSizeClasses[props.size],
        (props.disabled || props.loading) && buttonDisabledClasses,
        props.block && "w-full",
        props.className,
        attrs.class
      );
    });
    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style));
    return () => {
      const isDisabled = props.disabled || props.loading;
      const iconIsRight = props.iconPosition === "right";
      const loadingNode = props.loading ? h(
        "span",
        { class: iconIsRight ? "ml-2 order-1" : "mr-2" },
        slots["loading-icon"] ? slots["loading-icon"]() : createLoadingSpinner()
      ) : null;
      const iconNode = !props.loading && slots.icon ? h("span", { class: iconIsRight ? "ml-2 order-1" : "mr-2" }, slots.icon()) : null;
      return h(
        "button",
        {
          ...attrs,
          class: buttonClasses.value,
          style: mergedStyle.value,
          "aria-busy": attrs["aria-busy"] ?? (props.loading ? "true" : void 0),
          "aria-disabled": attrs["aria-disabled"] ?? (isDisabled ? "true" : void 0),
          disabled: isDisabled,
          type: props.htmlType,
          onClick: isDisabled ? void 0 : (event) => emit("click", event)
        },
        [loadingNode, iconNode, slots.default?.()]
      );
    };
  }
});
var CalendarIcon = createFilledIcon(CalendarIconPath, "w-5 h-5");
var CloseIcon = createFilledIcon(CloseIconPath, "w-4 h-4");
var ChevronLeftIcon = createFilledIcon(ChevronLeftIconPath, "w-5 h-5");
var ChevronRightIcon = createFilledIcon(ChevronRightIconPath, "w-5 h-5");
var isDateLike = (value) => value === null || value instanceof Date || typeof value === "string";
var isModelValue = (value) => {
  if (isDateLike(value)) return true;
  if (Array.isArray(value) && value.length === 2) {
    return isDateLike(value[0]) && isDateLike(value[1]);
  }
  return false;
};
var DatePicker = defineComponent({
  name: "TigerDatePicker",
  inheritAttrs: false,
  props: {
    /**
     * Enable range selection (start/end).
     * When true, v-model uses a tuple: [start, end].
     * @default false
     */
    range: {
      type: Boolean,
      default: false
    },
    /**
     * Locale used for month/day names in the calendar UI.
     * Example: 'zh-CN', 'en-US'
     */
    locale: {
      type: [String, Object]
    },
    /**
     * UI labels for i18n.
     */
    labels: {
      type: Object,
      default: void 0
    },
    /**
     * Selected date value (for v-model)
     */
    modelValue: {
      type: [Date, String, Array, null],
      default: null
    },
    /**
     * Date picker size
     * @default 'md'
     */
    size: {
      type: String,
      default: "md"
    },
    /**
     * Date format string
     * @default 'yyyy-MM-dd'
     */
    format: {
      type: String,
      default: "yyyy-MM-dd"
    },
    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      default: void 0
    },
    /**
     * Whether the date picker is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the date picker is readonly
     * @default false
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the date picker is required
     * @default false
     */
    required: {
      type: Boolean,
      default: false
    },
    /**
     * Minimum selectable date
     */
    minDate: {
      type: [Date, String, null],
      default: null
    },
    /**
     * Maximum selectable date
     */
    maxDate: {
      type: [Date, String, null],
      default: null
    },
    /**
     * Show clear button
     * @default true
     */
    clearable: {
      type: Boolean,
      default: true
    },
    /**
     * Input name attribute
     */
    name: {
      type: String
    },
    /**
     * Input id attribute
     */
    id: {
      type: String
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: ""
    },
    /**
     * Custom styles
     */
    style: {
      type: Object,
      default: void 0
    },
    /**
     * Shortcut presets for quick date selection
     */
    shortcuts: {
      type: Array,
      default: void 0
    }
  },
  emits: {
    /**
     * Emitted when date changes (for v-model)
     */
    "update:modelValue": (value) => {
      return isModelValue(value);
    },
    /**
     * Emitted when date changes
     */
    change: (value) => {
      return isModelValue(value);
    },
    /**
     * Emitted when clear button is clicked
     */
    clear: () => true
  },
  setup(props, { emit, attrs }) {
    const isOpen = ref(false);
    const calendarRef = ref(null);
    const inputWrapperRef = ref(null);
    const inputRef = ref(null);
    const activeDateIso = ref(null);
    const pendingFocusIso = ref(null);
    const restoreFocusEl = ref(null);
    const isRangeMode = computed(() => props.range);
    const selectedDate = computed(() => {
      if (isRangeMode.value) return null;
      return parseDate(props.modelValue);
    });
    const selectedRange = computed(() => {
      if (!isRangeMode.value) return [null, null];
      const raw = props.modelValue;
      if (!raw || !Array.isArray(raw)) return [null, null];
      return [parseDate(raw[0]), parseDate(raw[1])];
    });
    const minDateParsed = computed(() => parseDate(props.minDate));
    const maxDateParsed = computed(() => parseDate(props.maxDate));
    const localeCode = computed(() => getDatePickerLocaleCode(props.locale));
    const viewingMonth = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getMonth() ?? (/* @__PURE__ */ new Date()).getMonth()
    );
    const viewingYear = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getFullYear() ?? (/* @__PURE__ */ new Date()).getFullYear()
    );
    const displayValue = computed(() => {
      if (!isRangeMode.value) {
        return selectedDate.value ? formatDate(selectedDate.value, props.format, localeCode.value) : "";
      }
      const [start, end] = selectedRange.value;
      const startText = start ? formatDate(start, props.format, localeCode.value) : "";
      const endText = end ? formatDate(end, props.format, localeCode.value) : "";
      if (!startText && !endText) return "";
      if (startText && endText) return `${startText} - ${endText}`;
      return startText ? `${startText} - ` : ` - ${endText}`;
    });
    const placeholderText = computed(
      () => props.placeholder ?? (props.range ? "Select date range" : "Select date")
    );
    const showClearButton = computed(() => {
      if (!props.clearable || props.disabled || props.readonly) return false;
      if (!isRangeMode.value) return selectedDate.value !== null;
      const [start, end] = selectedRange.value;
      return start !== null || end !== null;
    });
    const calendarDays = computed(() => {
      return getCalendarDays(viewingYear.value, viewingMonth.value);
    });
    const dayNames = computed(() => getShortDayNames(localeCode.value));
    const isRtl = computed(() => getLocaleDirection(localeCode.value) === "rtl");
    const previousMonthIcon = computed(() => isRtl.value ? ChevronRightIcon : ChevronLeftIcon);
    const nextMonthIcon = computed(() => isRtl.value ? ChevronLeftIcon : ChevronRightIcon);
    const labels = computed(() => getDatePickerLabels(props.locale, props.labels));
    const emitValue = (value) => {
      emit("update:modelValue", value);
      emit("change", value);
    };
    const addDays = (date, days) => {
      const next = new Date(date);
      next.setDate(next.getDate() + days);
      return next;
    };
    const focusDateButtonByIso = (iso) => {
      const button = calendarRef.value?.querySelector(
        `button[data-date="${iso}"]`
      );
      if (!button || button.disabled) return false;
      button.focus();
      activeDateIso.value = iso;
      return true;
    };
    const getFirstEnabledIsoInView = () => {
      for (const date of calendarDays.value) {
        if (!date) continue;
        const iso = formatDate(date, "yyyy-MM-dd");
        if (!isDateDisabled(date)) return iso;
      }
      return null;
    };
    const getPreferredFocusIso = () => {
      const focusDate = isRangeMode.value ? selectedRange.value[0] ?? selectedRange.value[1] : selectedDate.value;
      if (focusDate) return formatDate(focusDate, "yyyy-MM-dd");
      const today = normalizeDate(/* @__PURE__ */ new Date());
      if (isDateInRange(today, minDateParsed.value, maxDateParsed.value)) {
        return formatDate(today, "yyyy-MM-dd");
      }
      return getFirstEnabledIsoInView();
    };
    const restoreFocus = () => {
      const target = restoreFocusEl.value ?? inputRef.value;
      if (!target) return;
      if (typeof target.focus === "function") {
        target.focus();
      }
    };
    const moveFocus = async (deltaDays) => {
      const activeEl = (void 0).activeElement;
      const currentIso = activeEl?.getAttribute("data-date") ?? activeDateIso.value ?? null;
      const baseIso = currentIso ?? getPreferredFocusIso();
      if (!baseIso) return;
      const baseDate = parseDate(baseIso);
      if (!baseDate) return;
      let candidate = addDays(baseDate, deltaDays);
      for (let attempts = 0; attempts < 42; attempts++) {
        const iso = formatDate(candidate, "yyyy-MM-dd");
        const el = calendarRef.value?.querySelector(
          `button[data-date="${iso}"]`
        );
        if (el && !el.disabled) {
          el.focus();
          activeDateIso.value = iso;
          return;
        }
        if (!el) {
          pendingFocusIso.value = iso;
          viewingYear.value = candidate.getFullYear();
          viewingMonth.value = candidate.getMonth();
          activeDateIso.value = iso;
          await nextTick();
          if (pendingFocusIso.value) {
            const nextIso = pendingFocusIso.value;
            pendingFocusIso.value = null;
            if (focusDateButtonByIso(nextIso)) return;
          }
          const fallback = getFirstEnabledIsoInView();
          if (fallback) focusDateButtonByIso(fallback);
          return;
        }
        candidate = addDays(candidate, deltaDays);
      }
    };
    const handleCalendarKeyDown = async (event) => {
      if (!isOpen.value) return;
      switch (event.key) {
        case "Escape": {
          event.preventDefault();
          closeCalendar();
          return;
        }
        case "ArrowRight": {
          event.preventDefault();
          await moveFocus(1);
          return;
        }
        case "ArrowLeft": {
          event.preventDefault();
          await moveFocus(-1);
          return;
        }
        case "ArrowDown": {
          event.preventDefault();
          await moveFocus(7);
          return;
        }
        case "ArrowUp": {
          event.preventDefault();
          await moveFocus(-7);
          return;
        }
        case "Enter":
        case " ": {
          const activeEl = (void 0).activeElement;
          if (activeEl?.tagName === "BUTTON" && activeEl.dataset.date) {
            event.preventDefault();
            if (!activeEl.disabled) activeEl.click();
          }
          return;
        }
      }
    };
    function toggleCalendar() {
      if (!props.disabled && !props.readonly) {
        isOpen.value = !isOpen.value;
        if (isOpen.value) {
          restoreFocusEl.value = inputRef.value ?? null;
          const baseDate = selectedDate.value ?? selectedRange.value[0];
          if (baseDate) {
            viewingMonth.value = baseDate.getMonth();
            viewingYear.value = baseDate.getFullYear();
          }
        }
      }
    }
    function closeCalendar() {
      isOpen.value = false;
    }
    function setToday() {
      selectDate(/* @__PURE__ */ new Date());
    }
    function handleShortcut(shortcut) {
      const val = typeof shortcut.value === "function" ? shortcut.value() : shortcut.value;
      emitValue(val);
      closeCalendar();
    }
    function selectDate(date) {
      if (!date) return;
      const normalizedDate = normalizeDate(date);
      if (!isDateInRange(normalizedDate, minDateParsed.value, maxDateParsed.value)) {
        return;
      }
      if (!isRangeMode.value) {
        emitValue(normalizedDate);
        closeCalendar();
        return;
      }
      const [start, end] = selectedRange.value;
      if (!start || start && end) {
        emitValue([normalizedDate, null]);
        return;
      }
      emitValue([start, normalizedDate < start ? start : normalizedDate]);
    }
    function clearDate(event) {
      event.stopPropagation();
      emitValue(!isRangeMode.value ? null : [null, null]);
      emit("clear");
    }
    function previousMonth() {
      if (viewingMonth.value === 0) {
        viewingMonth.value = 11;
        viewingYear.value--;
      } else {
        viewingMonth.value--;
      }
    }
    function nextMonth() {
      if (viewingMonth.value === 11) {
        viewingMonth.value = 0;
        viewingYear.value++;
      } else {
        viewingMonth.value++;
      }
    }
    function isDateDisabled(date) {
      if (!date) return true;
      return !isDateInRange(date, minDateParsed.value, maxDateParsed.value);
    }
    function isCurrentMonth(date) {
      if (!date) return false;
      return date.getMonth() === viewingMonth.value;
    }
    function handleClickOutside(event) {
      if (calendarRef.value && inputWrapperRef.value && !calendarRef.value.contains(event.target) && !inputWrapperRef.value.contains(event.target)) {
        closeCalendar();
      }
    }
    function handleInputClick() {
      toggleCalendar();
    }
    watch(isOpen, (newValue) => {
      if (newValue) {
        (void 0).addEventListener("click", handleClickOutside);
        const preferred = pendingFocusIso.value ?? getPreferredFocusIso();
        pendingFocusIso.value = null;
        nextTick().then(() => {
          if (preferred && focusDateButtonByIso(preferred)) return;
          const fallback = getFirstEnabledIsoInView();
          if (fallback) focusDateButtonByIso(fallback);
        });
      } else {
        (void 0).removeEventListener("click", handleClickOutside);
        nextTick().then(() => {
          restoreFocus();
        });
      }
    });
    const rootClass = computed(
      () => classNames(datePickerBaseClasses, props.className, coerceClassValue(attrs.class))
    );
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style));
    const forwardedAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs ?? {};
      return rest;
    });
    return () => {
      const inputClasses = getDatePickerInputClasses(props.size, props.disabled || props.readonly);
      const iconButtonClasses = getDatePickerIconButtonClasses(props.size);
      return h(
        "div",
        {
          ...forwardedAttrs.value,
          class: rootClass.value,
          style: rootStyle.value
        },
        [
          // Input wrapper
          h(
            "div",
            {
              ref: inputWrapperRef,
              class: datePickerInputWrapperClasses
            },
            [
              // Input field for date display
              h("input", {
                ref: inputRef,
                type: "text",
                class: inputClasses,
                value: displayValue.value,
                placeholder: placeholderText.value,
                disabled: props.disabled,
                readonly: true,
                // Always readonly to prevent manual text input and ensure date selection via calendar only
                required: props.required,
                name: props.name,
                id: props.id,
                onClick: handleInputClick,
                "aria-label": placeholderText.value
              }),
              // Clear button
              showClearButton.value && h(
                "button",
                {
                  type: "button",
                  class: datePickerClearButtonClasses,
                  onClick: clearDate,
                  "aria-label": labels.value.clearDate
                },
                CloseIcon
              ),
              // Calendar icon button
              h(
                "button",
                {
                  type: "button",
                  class: iconButtonClasses,
                  disabled: props.disabled || props.readonly,
                  onClick: toggleCalendar,
                  "aria-label": labels.value.toggleCalendar
                },
                CalendarIcon
              )
            ]
          ),
          // Calendar dropdown
          isOpen.value && h(
            "div",
            {
              ref: calendarRef,
              class: datePickerCalendarClasses,
              role: "dialog",
              "aria-modal": "true",
              "aria-label": labels.value.calendar,
              onKeydown: handleCalendarKeyDown
            },
            [
              // Calendar header
              h("div", { class: datePickerCalendarHeaderClasses }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: datePickerNavButtonClasses,
                    onClick: previousMonth,
                    "aria-label": labels.value.previousMonth
                  },
                  previousMonthIcon.value
                ),
                h(
                  "div",
                  { class: datePickerMonthYearClasses },
                  formatMonthYear(viewingYear.value, viewingMonth.value, localeCode.value)
                ),
                h(
                  "button",
                  {
                    type: "button",
                    class: datePickerNavButtonClasses,
                    onClick: nextMonth,
                    "aria-label": labels.value.nextMonth
                  },
                  nextMonthIcon.value
                )
              ]),
              // Day names header
              h("div", { class: datePickerCalendarGridClasses, role: "row" }, [
                ...dayNames.value.map(
                  (day) => h(
                    "div",
                    {
                      class: datePickerDayNameClasses,
                      key: day,
                      role: "columnheader"
                    },
                    day
                  )
                )
              ]),
              // Calendar grid
              (() => {
                const [rangeStart, rangeEnd] = selectedRange.value;
                const normStart = rangeStart ? normalizeDate(rangeStart) : null;
                const normEnd = rangeEnd ? normalizeDate(rangeEnd) : null;
                const isSelectingEnd = isRangeMode.value && Boolean(rangeStart) && !rangeEnd;
                return h(
                  "div",
                  {
                    class: datePickerCalendarGridClasses,
                    role: "grid",
                    "aria-rowcount": 6,
                    "aria-colcount": 7
                  },
                  [
                    ...calendarDays.value.map((date, index) => {
                      if (!date) return null;
                      const normDate = normalizeDate(date);
                      const isRangeStart = isRangeMode.value && rangeStart ? isSameDay(date, rangeStart) : false;
                      const isRangeEnd = isRangeMode.value && rangeEnd ? isSameDay(date, rangeEnd) : false;
                      const isInRange = isRangeMode.value && normStart && normEnd && normDate >= normStart && normDate <= normEnd;
                      const isSelected = !isRangeMode.value ? selectedDate.value ? isSameDay(date, selectedDate.value) : false : isRangeStart || isRangeEnd;
                      const isCurrentMonthDay = isCurrentMonth(date);
                      const isTodayDay = isToday(date);
                      const isBeforeRangeStart = isSelectingEnd && normStart && normDate < normStart;
                      const isDisabled = isDateDisabled(date) || Boolean(isBeforeRangeStart);
                      const iso = formatDate(date, "yyyy-MM-dd");
                      return h(
                        "button",
                        {
                          key: index,
                          type: "button",
                          class: getDatePickerDayCellClasses(
                            isCurrentMonthDay,
                            isSelected,
                            isTodayDay,
                            isDisabled,
                            Boolean(isInRange),
                            Boolean(isRangeStart),
                            Boolean(isRangeEnd)
                          ),
                          disabled: isDisabled,
                          onClick: () => selectDate(date),
                          role: "gridcell",
                          "data-date": iso,
                          onFocus: () => {
                            activeDateIso.value = iso;
                          },
                          tabindex: activeDateIso.value === iso && !isDisabled ? 0 : -1,
                          "aria-label": iso,
                          "aria-selected": isSelected,
                          "aria-current": isTodayDay ? "date" : void 0
                        },
                        date.getDate()
                      );
                    })
                  ]
                );
              })(),
              // Shortcuts panel
              props.shortcuts?.length ? h(
                "div",
                {
                  class: "flex flex-wrap gap-1 px-3 py-2 border-t border-[var(--tiger-border,#e5e7eb)]"
                },
                props.shortcuts.map(
                  (sc) => h(
                    "button",
                    {
                      type: "button",
                      class: datePickerFooterButtonClasses,
                      onClick: () => handleShortcut(sc)
                    },
                    sc.label
                  )
                )
              ) : null,
              // Footer (range mode only)
              isRangeMode.value ? h("div", { class: datePickerFooterClasses }, [
                h(
                  "button",
                  {
                    type: "button",
                    class: datePickerFooterButtonClasses,
                    onClick: setToday
                  },
                  labels.value.today
                ),
                h(
                  "button",
                  {
                    type: "button",
                    class: datePickerFooterButtonClasses,
                    onClick: closeCalendar
                  },
                  labels.value.ok
                )
              ]) : null
            ]
          )
        ]
      );
    };
  }
});
var BarChart = defineComponent({
  name: "TigerBarChart",
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 200
    },
    padding: {
      type: [Number, Object],
      default: 24
    },
    data: {
      type: Array,
      required: true
    },
    xScale: {
      type: Object
    },
    yScale: {
      type: Object
    },
    barColor: {
      type: String,
      default: "var(--tiger-primary,#2563eb)"
    },
    barRadius: {
      type: Number,
      default: 4
    },
    barPaddingInner: {
      type: Number,
      default: 0.2
    },
    barPaddingOuter: {
      type: Number,
      default: 0.1
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    showAxis: {
      type: Boolean,
      default: true
    },
    showXAxis: {
      type: Boolean,
      default: true
    },
    showYAxis: {
      type: Boolean,
      default: true
    },
    xAxisLabel: {
      type: String
    },
    yAxisLabel: {
      type: String
    },
    xTicks: {
      type: Number,
      default: 5
    },
    yTicks: {
      type: Number,
      default: 5
    },
    xTickValues: {
      type: Array
    },
    yTickValues: {
      type: Array
    },
    xTickFormat: {
      type: Function
    },
    yTickFormat: {
      type: Function
    },
    gridLineStyle: {
      type: String,
      default: "solid"
    },
    gridStrokeWidth: {
      type: Number,
      default: 1
    },
    // Interaction props
    hoverable: {
      type: Boolean,
      default: false
    },
    hoveredIndex: {
      type: Number,
      default: void 0
    },
    activeOpacity: {
      type: Number,
      default: 1
    },
    inactiveOpacity: {
      type: Number,
      default: 0.25
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectedIndex: {
      type: Number,
      default: void 0
    },
    // Legend props
    showLegend: {
      type: Boolean,
      default: false
    },
    legendPosition: {
      type: String,
      default: "bottom"
    },
    legendMarkerSize: {
      type: Number,
      default: 10
    },
    legendGap: {
      type: Number,
      default: 8
    },
    // Tooltip props
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function
    },
    // Value label props
    showValueLabels: {
      type: Boolean,
      default: false
    },
    valueLabelPosition: {
      type: String,
      default: "top"
    },
    valueLabelFormatter: {
      type: Function
    },
    // Bar constraint props
    barMinHeight: {
      type: Number,
      default: 0
    },
    barMaxWidth: {
      type: Number
    },
    // Visual enhancement props
    gradient: {
      type: Boolean,
      default: false
    },
    animated: {
      type: Boolean,
      default: false
    },
    // Other
    colors: {
      type: Array
    },
    title: {
      type: String
    },
    desc: {
      type: String
    },
    className: {
      type: String
    }
  },
  emits: ["update:hoveredIndex", "update:selectedIndex", "bar-click", "bar-hover"],
  setup(props, { emit }) {
    const gradientPrefix = getStableChartGradientPrefix("bar", useId());
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      getElementOpacity,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave,
      wrapperClasses
    } = useChartInteraction({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit,
      getData: (index) => props.data[index],
      eventNames: { hover: "bar-hover", click: "bar-click" }
    });
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding));
    const xDomain = computed(() => props.data.map((item) => String(item.x)));
    const yValues = computed(() => props.data.map((item) => item.y));
    const resolvedXScale = computed(() => {
      if (props.xScale) return props.xScale;
      return createBandScale(xDomain.value, [0, innerRect.value.width], {
        paddingInner: props.barPaddingInner,
        paddingOuter: props.barPaddingOuter
      });
    });
    const resolvedYScale = computed(() => {
      if (props.yScale) return props.yScale;
      const extent = getNumberExtent(yValues.value, { includeZero: true });
      return createLinearScale(extent, [innerRect.value.height, 0]);
    });
    const shouldShowXAxis = computed(() => props.showAxis && props.showXAxis);
    const shouldShowYAxis = computed(() => props.showAxis && props.showYAxis);
    const palette = computed(() => resolveChartPalette(props.colors, props.barColor));
    const bars = computed(() => {
      const scale = resolvedXScale.value;
      const rawBandWidth = scale.bandwidth ?? (scale.step ? scale.step * 0.7 : innerRect.value.width / Math.max(1, props.data.length) * 0.8);
      const bandWidth = clampBarWidth(rawBandWidth, props.barMaxWidth);
      const bandOffset = rawBandWidth > bandWidth ? (rawBandWidth - bandWidth) / 2 : 0;
      const baseline = resolvedYScale.value.map(0);
      return props.data.map((item, index) => {
        const xKey = scale.type === "linear" ? Number(item.x) : String(item.x);
        const xPos = scale.map(xKey);
        const barX = (scale.bandwidth ? xPos : xPos - rawBandWidth / 2) + bandOffset;
        const barYValue = resolvedYScale.value.map(item.y);
        let barHeight = Math.abs(baseline - barYValue);
        let barY = Math.min(baseline, barYValue);
        if (props.barMinHeight > 0 && barHeight > 0) {
          const clamped = ensureBarMinHeight(barY, barHeight, baseline, props.barMinHeight);
          barY = clamped.y;
          barHeight = clamped.height;
        }
        const color = item.color ?? palette.value[index % palette.value.length];
        const opacity = getElementOpacity(index);
        return {
          x: barX,
          y: barY,
          width: bandWidth,
          height: barHeight,
          color,
          opacity,
          datum: item,
          index
        };
      });
    });
    const legendItems = computed(
      () => buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (d) => d.label ?? String(d.x),
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    );
    const tooltipContent = computed(
      () => resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        defaultXYTooltipFormatter
      )
    );
    return () => {
      const gradientDefs = props.gradient ? h(
        "defs",
        null,
        bars.value.map(
          (bar, index) => h(
            "linearGradient",
            {
              id: `${gradientPrefix}-${index}`,
              x1: "0",
              y1: "0",
              x2: "0",
              y2: "1"
            },
            [
              h("stop", {
                offset: "0%",
                "stop-color": bar.color,
                "stop-opacity": "0.65"
              }),
              h("stop", {
                offset: "100%",
                "stop-color": bar.color,
                "stop-opacity": "1"
              })
            ]
          )
        )
      ) : null;
      const valueLabels = props.showValueLabels && bars.value.length > 0 ? bars.value.map((bar, index) => {
        const labelText = props.valueLabelFormatter ? props.valueLabelFormatter(bar.datum, index) : String(bar.datum.y);
        const labelY = getBarValueLabelY(bar.y, bar.height, props.valueLabelPosition, 8);
        const isInside = props.valueLabelPosition === "inside";
        return h(
          "text",
          {
            key: `label-${index}`,
            x: bar.x + bar.width / 2,
            y: labelY,
            "text-anchor": "middle",
            "dominant-baseline": isInside ? "central" : "auto",
            class: isInside ? barValueLabelInsideClasses : barValueLabelClasses,
            opacity: bar.opacity,
            "data-value-label": ""
          },
          labelText
        );
      }) : [];
      const chart = h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          title: props.title,
          desc: props.desc,
          className: classNames(props.className)
        },
        {
          default: () => [
            gradientDefs,
            props.showGrid ? h(ChartGrid, {
              xScale: resolvedXScale.value,
              yScale: resolvedYScale.value,
              show: "both",
              xTicks: props.xTicks,
              yTicks: props.yTicks,
              xTickValues: props.xTickValues,
              yTickValues: props.yTickValues,
              lineStyle: props.gridLineStyle,
              strokeWidth: props.gridStrokeWidth
            }) : null,
            shouldShowXAxis.value ? h(ChartAxis, {
              scale: resolvedXScale.value,
              orientation: "bottom",
              y: innerRect.value.height,
              ticks: props.xTicks,
              tickValues: props.xTickValues,
              tickFormat: props.xTickFormat,
              label: props.xAxisLabel
            }) : null,
            shouldShowYAxis.value ? h(ChartAxis, {
              scale: resolvedYScale.value,
              orientation: "left",
              ticks: props.yTicks,
              tickValues: props.yTickValues,
              tickFormat: props.yTickFormat,
              label: props.yAxisLabel
            }) : null,
            h(
              ChartSeries,
              {
                data: props.data,
                type: "bar"
              },
              {
                default: () => bars.value.map(
                  (bar, index) => h("rect", {
                    key: `bar-${index}`,
                    x: bar.x,
                    y: bar.y,
                    width: bar.width,
                    height: bar.height,
                    rx: props.barRadius,
                    ry: props.barRadius,
                    fill: props.gradient ? `url(#${gradientPrefix}-${index})` : bar.color,
                    opacity: bar.opacity,
                    class: classNames(
                      "transition-[opacity,filter] duration-200",
                      (props.hoverable || props.selectable) && "cursor-pointer hover:brightness-110"
                    ),
                    style: props.animated ? `rx:var(--tiger-chart-bar-radius,${props.barRadius}px);ry:var(--tiger-chart-bar-radius,${props.barRadius}px);${barAnimatedTransition}` : `rx:var(--tiger-chart-bar-radius,${props.barRadius}px);ry:var(--tiger-chart-bar-radius,${props.barRadius}px)`,
                    tabindex: props.selectable ? 0 : void 0,
                    role: props.selectable ? "button" : "img",
                    "aria-label": bar.datum.label ?? String(bar.datum.x),
                    "data-bar-index": index,
                    onMouseenter: (e) => handleMouseEnter(index, e),
                    onMousemove: handleMouseMove,
                    onMouseleave: handleMouseLeave,
                    onClick: () => handleClick(index),
                    onKeydown: (e) => handleKeyDown(e, index)
                  })
                )
              }
            ),
            ...valueLabels
          ].filter(Boolean)
        }
      );
      const tooltip = props.showTooltip && props.hoverable ? h(ChartTooltip, {
        content: tooltipContent.value,
        visible: resolvedHoveredIndex.value !== null && tooltipContent.value !== "",
        x: tooltipPosition.value.x,
        y: tooltipPosition.value.y
      }) : null;
      if (!props.showLegend) {
        return h("div", { class: "inline-block relative" }, [chart, tooltip]);
      }
      return h("div", { class: wrapperClasses.value }, [
        chart,
        h(ChartLegend, {
          items: legendItems.value,
          position: props.legendPosition,
          markerSize: props.legendMarkerSize,
          gap: props.legendGap,
          interactive: props.hoverable || props.selectable,
          onItemClick: handleLegendClick,
          onItemHover: handleLegendHover,
          onItemLeave: handleLegendLeave
        }),
        tooltip
      ]);
    };
  }
});
var zhCN = {
  locale: "zh-CN",
  direction: "ltr",
  common: {
    okText: "确定",
    cancelText: "取消",
    closeText: "关闭",
    loadingText: "加载中...",
    emptyText: "暂无数据"
  },
  modal: {
    closeAriaLabel: "关闭",
    okText: "确定",
    cancelText: "取消"
  },
  drawer: {
    closeAriaLabel: "关闭"
  },
  pagination: {
    totalText: "共 {total} 条",
    itemsPerPageText: "条/页",
    jumpToText: "跳至",
    pageText: "页",
    prevPageAriaLabel: "上一页",
    nextPageAriaLabel: "下一页",
    pageAriaLabel: "第 {page} 页"
  },
  formWizard: {
    prevText: "上一步",
    nextText: "下一步",
    finishText: "完成"
  },
  taskBoard: {
    emptyColumnText: "暂无任务",
    addCardText: "添加任务",
    wipLimitText: "WIP 限制: {limit}",
    dragHintText: "拖拽以移动",
    boardAriaLabel: "任务看板"
  }
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    const selectedDate = new Date(2024, 0, 15);
    const chartData = [
      { x: "Vue SSR", y: 18 },
      { x: "Hydration", y: 24 },
      { x: "Nuxt", y: 16 }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref$1(ConfigProvider), mergeProps({ locale: unref$1(zhCN) }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<main class="ssr-shell"${_scopeId}><section class="ssr-panel"${_scopeId}><p class="eyebrow"${_scopeId}>Nuxt 3 SSR</p><h1${_scopeId}>Tigercat Vue SSR smoke page</h1><p class="copy"${_scopeId}> This page renders Tigercat Vue components during Nuxt SSR and then hydrates the same component tree on the client. </p><div class="toolbar"${_scopeId}>`);
            _push2(ssrRenderComponent(unref$1(Button), { variant: "primary" }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`保存`);
                } else {
                  return [
                    createTextVNode("保存")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref$1(DatePicker), {
              "model-value": unref$1(selectedDate),
              locale: "zh-CN"
            }, null, _parent2, _scopeId));
            _push2(`</div></section><section class="ssr-panel"${_scopeId}>`);
            _push2(ssrRenderComponent(unref$1(BarChart), {
              data: chartData,
              width: 420,
              height: 240,
              title: "Nuxt SSR chart",
              desc: "Bar chart rendered through Nuxt SSR",
              gradient: ""
            }, null, _parent2, _scopeId));
            _push2(`</section></main>`);
          } else {
            return [
              createVNode("main", { class: "ssr-shell" }, [
                createVNode("section", { class: "ssr-panel" }, [
                  createVNode("p", { class: "eyebrow" }, "Nuxt 3 SSR"),
                  createVNode("h1", null, "Tigercat Vue SSR smoke page"),
                  createVNode("p", { class: "copy" }, " This page renders Tigercat Vue components during Nuxt SSR and then hydrates the same component tree on the client. "),
                  createVNode("div", { class: "toolbar" }, [
                    createVNode(unref$1(Button), { variant: "primary" }, {
                      default: withCtx(() => [
                        createTextVNode("保存")
                      ]),
                      _: 1
                    }),
                    createVNode(unref$1(DatePicker), {
                      "model-value": unref$1(selectedDate),
                      locale: "zh-CN"
                    }, null, 8, ["model-value"])
                  ])
                ]),
                createVNode("section", { class: "ssr-panel" }, [
                  createVNode(unref$1(BarChart), {
                    data: chartData,
                    width: 420,
                    height: 240,
                    title: "Nuxt SSR chart",
                    desc: "Bar chart rendered through Nuxt SSR",
                    gradient: ""
                  })
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-Cx98gIkj.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-CE0APjso.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref$1(ErrorTemplate), mergeProps({ status: unref$1(status), statusText: unref$1(statusText), statusCode: unref$1(status), statusMessage: unref$1(statusText), description: unref$1(description), stack: unref$1(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/nuxt@3.21.6_@parcel+watcher@2.5.6_@types+node@25.6.0_@vue+compiler-sfc@3.5.34_cac@6.7.1_76d4efd173c0bb09edff2d193077160c/node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref$1(abortRender)) {
            _push(`<div></div>`);
          } else if (unref$1(error)) {
            _push(ssrRenderComponent(unref$1(_sfc_main$1), { error: unref$1(error) }, null, _parent));
          } else if (unref$1(islandContext)) {
            _push(ssrRenderComponent(unref$1(IslandRenderer), { context: unref$1(islandContext) }, null, _parent));
          } else if (unref$1(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref$1(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref$1(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../../node_modules/.pnpm/nuxt@3.21.6_@parcel+watcher@2.5.6_@types+node@25.6.0_@vue+compiler-sfc@3.5.34_cac@6.7.1_76d4efd173c0bb09edff2d193077160c/node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, entry_default as default, encodeRoutePath as e, navigateTo as n, resolveRouteObject as r, tryUseNuxtApp as t, useRouter as u };
//# sourceMappingURL=server.mjs.map
