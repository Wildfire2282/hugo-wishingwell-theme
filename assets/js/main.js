/* ==========================================================================
   main.js · 入口 / 单文件交互总线
   --------------------------------------------------------------------------
   使命：串联 Hero 投币、导航与目录、滚动、搜索、主题与入场等全站交互，
   以 Vanilla 单文件交付，避免框架负担；
   禁令：零第三方依赖，所有监听经 globalSignal 统一回收，pagehide 时
   集中 abort，防止单页与往返缓存下的监听泄漏；
   关联：见 DESIGN.md §6 动效与 §7 组件规范，以及 COMMENTS.md §4
   JavaScript 约定。
   ========================================================================== */

/* ========== 基础 · 全局信号 ========== */

// 将 html.no-js 置换为 js，供 CSS 区分无脚本与可交互状态，避免首帧闪烁。
document.documentElement.classList.replace("no-js", "js");

// 仅监听一次 pagehide，避免往返缓存中重复 abort 导致后续交互失效。
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

const globalAbort = new AbortController();
const globalSignal = globalAbort.signal;
window.addEventListener("pagehide", () => globalAbort.abort(), { once: true });

/* ========== Hero 投币状态机 ========== */
// 状态：pending → playing → has-played，由 initialPlayFinished 与 hoverArmed 双门控，确保仅自动播放一次后才允许悬停重放，避免动效骚扰。
const hero = document.querySelector(".hero");
const wishDrop = hero?.querySelector(".wish-drop");
const animationEndTarget = hero?.querySelector(".wish-drop__animation-end");

if (hero && wishDrop && animationEndTarget) {
  let autoPlayTimer;
  let initialPlayFinished = false;
  let hoverArmed = true;

  // 移除 is-playing 即可立即中断涟漪编排，交由 CSS 将动画压为瞬时。
  const stopHeroAnimation = () => hero.classList.remove("is-playing");
  const cancelAutoPlay = () => {
    window.clearTimeout(autoPlayTimer);
    hero.classList.remove("is-animation-pending");
  };
  // 需同时满足未偏好减少动效且未处于播放中，避免重叠触发导致动画队列堆积。
  const playHeroAnimation = () => {
    if (reducedMotion.matches || hero.classList.contains("is-playing")) return;
    hero.classList.remove("is-animation-pending");
    hero.classList.add("is-playing");
  };
  // 延迟 1s 再起播，给予首帧布局与字体就绪时间，减少布局抖动感。
  const scheduleAutoPlay = () => {
    if (reducedMotion.matches) return;
    window.clearTimeout(autoPlayTimer);
    hero.classList.add("is-animation-pending");
    autoPlayTimer = window.setTimeout(playHeroAnimation, 1000);
  };

  const onAnimationEnd = (event) => {
    if (event.animationName !== "ripple-six") return;
    stopHeroAnimation();
    hero.classList.add("has-played");
    initialPlayFinished = true;
  };

  animationEndTarget.addEventListener("animationend", onAnimationEnd, { signal: globalSignal });
  animationEndTarget.addEventListener("animationcancel", stopHeroAnimation, {
    signal: globalSignal,
  });

  // 仅在首播完成后且悬停已重新武装时响应，避免鼠标快速往返连续触发。
  const onPointerEnter = () => {
    if (!initialPlayFinished || !hoverArmed) return;
    hoverArmed = false;
    playHeroAnimation();
  };
  const onPointerLeave = () => {
    hoverArmed = true;
  };
  let hoverAttached = false;
  const attachHover = () => {
    if (hoverAttached || !canHover.matches) return;
    wishDrop.addEventListener("pointerenter", onPointerEnter, { signal: globalSignal });
    wishDrop.addEventListener("pointerleave", onPointerLeave, { signal: globalSignal });
    hoverAttached = true;
  };
  const detachHover = () => {
    if (!hoverAttached) return;
    wishDrop.removeEventListener("pointerenter", onPointerEnter);
    wishDrop.removeEventListener("pointerleave", onPointerLeave);
    hoverAttached = false;
  };
  if (canHover.matches) attachHover();

  /* ========== Hero · 悬停与降级熔断 ========== */
  // 若用户中途开启减少动效，需立即熔断 pending 与 playing，并固化 has-played，避免后续悬停再次起播。
  const handleReducedMotionChange = (event) => {
    if (event.matches) {
      cancelAutoPlay();
      stopHeroAnimation();
      hero.classList.add("has-played");
      initialPlayFinished = true;
      detachHover();
    }
  };
  reducedMotion.addEventListener("change", handleReducedMotionChange, { signal: globalSignal });

  // 页面不可见时清除定时器，避免切回后突兀起播。
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) window.clearTimeout(autoPlayTimer);
    },
    { signal: globalSignal }
  );
  window.addEventListener("pagehide", () => window.clearTimeout(autoPlayTimer), { signal: globalSignal });

  if (reducedMotion.matches) {
    hero.classList.add("has-played");
    initialPlayFinished = true;
  } else {
    scheduleAutoPlay();
  }
}

/* ========== 导航与目录 · 状态与焦点 ========== */
// 导航与目录共享互斥与滚动锁定语义，任一展开即加锁并惰性隔离主内容，保障焦点不外泄。

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeaderEnd = document.querySelector(".site-header__end");
const navBackdrop = document.querySelector(".nav-backdrop");

const fab = document.querySelector(".toc-fab");
const sheet = document.querySelector(".toc-sheet");
const backdrop = document.querySelector(".toc-backdrop");
const closeBtn = sheet?.querySelector(".toc-sheet__close");

let navOpenState = false;
let tocOpenState = false;
let previousNavFocus = null;
let previousTocFocus = null;
let navHideTimer = null;
let navCloseTimer = null;
window.addEventListener("pagehide", () => window.clearTimeout(navHideTimer), { signal: globalSignal });
window.addEventListener("pagehide", () => window.clearTimeout(navCloseTimer), { signal: globalSignal });
if (siteHeaderEnd && !siteHeaderEnd.hasAttribute("tabindex"))
  siteHeaderEnd.setAttribute("tabindex", "-1");

// 收集容器内可聚焦元素，需过滤 hidden 与不可见节点，避免焦点跳至隐藏控件。
const getFocusable = (container) => {
  if (!container) return [];
  const selectors =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const nodes = [...container.querySelectorAll(selectors)];
  return nodes.filter((el) => {
    if (el.hasAttribute("hidden")) return false;
    if (el.closest("[hidden]")) return false;
    if (el.closest('[aria-hidden="true"]')) return false;
    // offsetParent 在 flex 或 fixed 场景下误判，改用可视矩形与计算样式双重判定，避免遗漏可聚焦项。
    if (el.getClientRects().length === 0 && el !== document.activeElement) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return true;
  });
};

// 通过 html.is-locked 驱动 CSS overflow 隐藏，JS 仅切换类与惰性隔离，避免与 :has 兜底冲突。
const syncBodyLock = () => {
  const locked = navOpenState || tocOpenState;
  document.documentElement.classList.toggle("is-locked", locked);
  document.documentElement.classList.toggle("is-nav-open", navOpenState);
  document.documentElement.style.overscrollBehavior = locked ? "none" : "";
  document.body.style.overscrollBehavior = locked ? "contain" : "";
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    if ("inert" in mainContent) {
      mainContent.inert = locked;
    } else if (locked) {
      mainContent.setAttribute("aria-hidden", "true");
    } else {
      mainContent.removeAttribute("aria-hidden");
    }
  }
};

// 将 Tab 限制在容器首尾循环，防止焦点穿越至底层页面，满足抽屉模态语义。
const trapTab = (event, container) => {
  if (event.key !== "Tab" || !container) return;
  const focusable = getFocusable(container);
  if (focusable.length === 0) {
    event.preventDefault();
    container.focus?.();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

/* ========== 导航与目录 · 抽屉控制（导航） ========== */

const setNavOpen = (isOpen) => {
  if (isOpen === navOpenState) return;
  // 互斥收敛：展开导航前若目录已开则先收起目录，避免双层遮罩与双重锁定叠加。
  if (isOpen && tocOpenState) setTocOpen(false);
  navOpenState = isOpen;
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  navToggle?.setAttribute("aria-label", isOpen ? "关闭导航" : "打开导航");
  const label = navToggle?.querySelector(".nav-toggle__label");
  if (label) label.textContent = isOpen ? "关闭" : "导航";
  // 旧结构兼容：siteNav 仍切换 is-open，深色切换的可见性改由 siteHeaderEnd.is-open 驱动。
  siteNav?.classList.toggle("is-open", isOpen);
  if (siteHeaderEnd) {
    if (isOpen) {
      if (navHideTimer) {
        clearTimeout(navHideTimer);
        navHideTimer = null;
      }
      siteHeaderEnd.hidden = false;
      siteHeaderEnd.removeAttribute("hidden");
      void siteHeaderEnd.offsetWidth;
      siteHeaderEnd.classList.add("is-open");
    } else {
      siteHeaderEnd.classList.remove("is-open");
      const delay = reducedMotion.matches ? 0 : 260;
      navHideTimer = setTimeout(() => {
        siteHeaderEnd.hidden = true;
        navHideTimer = null;
      }, delay);
    }
  }
  if (navBackdrop) {
    if (isOpen) {
      navBackdrop.hidden = false;
      navBackdrop.removeAttribute("hidden");
    } else {
      // 遮罩无过渡，立即隐藏可减少一次重绘。
      navBackdrop.hidden = true;
    }
  }
  if (isOpen) {
    previousNavFocus = document.activeElement;
    syncBodyLock();
    const focusable = getFocusable(siteHeaderEnd || siteNav);
    const target = focusable[0] || siteNav || siteHeaderEnd;
    target?.focus?.();
  } else {
    syncBodyLock();
    const restore = previousNavFocus;
    previousNavFocus = null;
    if (restore && typeof restore.focus === "function" && document.contains(restore)) {
      restore.focus();
    } else {
      navToggle?.focus();
    }
  }
};

/* ========== 导航与目录 · 抽屉控制（目录） ========== */

const setTocOpen = (open) => {
  if (open === tocOpenState) return;
  if (open && navOpenState) setNavOpen(false);
  tocOpenState = open;
  if (fab) {
    fab.setAttribute("aria-expanded", String(open));
    fab.setAttribute("aria-label", open ? "关闭目录" : "打开目录");
  }
  // 目录弹层仅以 hidden 控制显隐，非阻塞式设计：允许背景滚动，焦点由 trapTab 限制但不加 inert/锁滚动，见 DESIGN.md §7 “TOC”。
  if (backdrop) backdrop.hidden = !open;
  if (sheet) {
    sheet.hidden = !open;
    if (open) {
      previousTocFocus = document.activeElement;
      const target = sheet.querySelector('a[href^="#"]') || closeBtn || sheet;
      target?.focus?.();
    } else {
      const restore = previousTocFocus;
      previousTocFocus = null;
      if (restore?.closest?.(".toc-sheet")) fab?.focus();
      else if (restore && typeof restore.focus === "function" && document.contains(restore))
        restore.focus();
      else fab?.focus();
    }
  }
};

navToggle?.addEventListener(
  "click",
  () => setNavOpen(navToggle.getAttribute("aria-expanded") !== "true"),
  {
    signal: globalSignal,
  }
);
navBackdrop?.addEventListener("click", () => setNavOpen(false), { signal: globalSignal });
siteNav?.addEventListener(
  "click",
  (event) => {
    const a = event.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    // 页内锚点可立即收起；跨页跳转需延迟 60ms，避免同步 hidden 取消浏览器默认导航。
    if (href.startsWith("#")) setNavOpen(false);
    else {
      window.clearTimeout(navCloseTimer);
      navCloseTimer = window.setTimeout(() => setNavOpen(false), 60);
    }
  },
  { signal: globalSignal }
);
siteHeaderEnd?.addEventListener(
  "click",
  (event) => {
    // 抽屉内主题切换不应收起，仅链接需要收起，沿用同上延迟策略。
    const a = event.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) setNavOpen(false);
    else {
      window.clearTimeout(navCloseTimer);
      navCloseTimer = window.setTimeout(() => setNavOpen(false), 60);
    }
  },
  { signal: globalSignal }
);
siteHeaderEnd?.addEventListener(
  "keydown",
  (event) => {
    if (navOpenState) trapTab(event, siteHeaderEnd);
  },
  { signal: globalSignal }
);
siteNav?.addEventListener(
  "keydown",
  (event) => {
    if (navOpenState) trapTab(event, siteNav);
  },
  { signal: globalSignal }
);

/* ========== 导航与目录 · 事件绑定（目录与键盘） ========== */

fab?.addEventListener("click", () => setTocOpen(fab.getAttribute("aria-expanded") !== "true"), {
  signal: globalSignal,
});
closeBtn?.addEventListener("click", () => setTocOpen(false), { signal: globalSignal });
backdrop?.addEventListener("click", () => setTocOpen(false), { signal: globalSignal });
sheet?.addEventListener(
  "click",
  (event) => {
    if (event.target.closest("a")) setTocOpen(false);
  },
  { signal: globalSignal }
);
sheet?.addEventListener(
  "keydown",
  (event) => {
    if (tocOpenState) trapTab(event, sheet);
  },
  { signal: globalSignal }
);

// Escape 按目录优先、导航其次的顺序分发，确保模态层级符合用户预期。
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;
    if (tocOpenState) {
      event.preventDefault();
      event.stopPropagation();
      setTocOpen(false);
      return;
    }
    if (navOpenState) {
      event.preventDefault();
      event.stopPropagation();
      setNavOpen(false);
      navToggle?.focus();
    }
  },
  { signal: globalSignal }
);

/* ========== 导航与目录 · 断点同步 ========== */

// 切回桌面断点时自动收起抽屉，避免移动端状态残留至桌面布局。
const desktopMQ = window.matchMedia("(min-width: 721px)");
const handleDesktopMQ = (event) => {
  const matches = event?.matches ?? desktopMQ.matches;
  if (matches) setNavOpen(false);
};
desktopMQ.addEventListener("change", handleDesktopMQ, { signal: globalSignal });
const tocMQ = window.matchMedia("(min-width: 901px)");
const handleTocMQ = (event) => {
  const matches = event?.matches ?? tocMQ.matches;
  if (matches) setTocOpen(false);
};
tocMQ.addEventListener("change", handleTocMQ, { signal: globalSignal });

/* ========== 滚动 · 进度与头部（索引） ========== */

const progress = document.querySelector(".reading-progress");
const articleContent = document.querySelector(".article-content");
const siteHeader = document.querySelector(".site-header");
const backToTop = document.querySelector("[data-back-to-top]");
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"], .toc-sheet a[href^="#"]')];

// CSS.escape 不可用时提供最小可用转义，保证以数字或特殊字符开头的标题仍可被查询到。
const cssEscape =
  typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape.bind(CSS)
    : (value) => {
        const str = String(value);
        if (!str) return "";
        const firstCode = str.charCodeAt(0);
        if (firstCode >= 0x30 && firstCode <= 0x39) {
          let out = `\\3${str[0]} `;
          for (let i = 1; i < str.length; i++) {
            const ch = str[i];
            out += /[a-zA-Z0-9_-]/.test(ch) ? ch : `\\${ch}`;
          }
          return out;
        }
        if (
          str.length > 1 &&
          str[0] === "-" &&
          str.charCodeAt(1) >= 0x30 &&
          str.charCodeAt(1) <= 0x39
        ) {
          let out = "\\-";
          out += `\\3${str[1]} `;
          for (let i = 2; i < str.length; i++) {
            const ch = str[i];
            out += /[a-zA-Z0-9_-]/.test(ch) ? ch : `\\${ch}`;
          }
          return out;
        }
        return str.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
      };

// 以目录链接反查正文标题并按文档顺序排序，缺失标题则忽略，避免空锚点误高亮。
const spyTargets = (() => {
  if (!articleContent) return [];
  const seen = new Map();
  for (const link of tocLinks) {
    let id = "";
    try {
      id = decodeURIComponent(link.hash.slice(1));
    } catch (_) {
      continue;
    }
    if (!id) continue;
    const heading = articleContent.querySelector(`#${cssEscape(id)}`);
    if (!heading) continue;
    if (!seen.has(heading)) seen.set(heading, { link, heading });
  }
  const values = [...seen.values()];
  values.sort((a, b) => {
    const pos = a.heading.compareDocumentPosition(b.heading);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
  return values;
})();

/* ========== 滚动 · 进度与头部（视口） ========== */

let headerH = 82;
const updateHeaderH = () => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  const parsed = Number.parseFloat(raw);
  headerH = Number.isFinite(parsed) ? parsed : 82;
};
updateHeaderH();

let framePending = false;

// 同步头部固化、阅读进度与返回顶部显隐，进度以文章区段占视口比例计算，避免短文进度跳变。
const updateScrollState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 4);

  if (articleContent && progress) {
    const start = articleContent.offsetTop;
    const end = start + articleContent.offsetHeight - window.innerHeight;
    const value = end > start ? (window.scrollY - start) / (end - start) : 1;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  }

  backToTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.9);

  framePending = false;
};

const requestScrollUpdate = () => {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateScrollState);
  }
};

/* ========== 滚动 · 目录高亮 ========== */

// 以 IntersectionObserver 驱动目录高亮，避免每帧读取几何信息带来的回流开销。
let spyObserver = null;
const createSpyObserver = () => {
  if (spyObserver) spyObserver.disconnect();
  if (!spyTargets.length) return;
  const headingToLink = new Map(spyTargets.map((item) => [item.heading, item.link]));
  let currentHash = "";
  spyObserver = new IntersectionObserver(
    (entries) => {
      const visible = [];
      for (const entry of entries) {
        if (entry.isIntersecting) visible.push(entry.target);
      }
      if (visible.length) {
        visible.sort((a, b) => {
          const pos = a.compareDocumentPosition(b);
          if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          return 0;
        });
        const top = visible[0];
        const link = headingToLink.get(top);
        if (link && link.hash !== currentHash) {
          currentHash = link.hash;
          for (const l of tocLinks) {
            const active = l.hash === currentHash;
            l.classList.toggle("is-active", active);
            if (active) l.setAttribute("aria-current", "location");
            else l.removeAttribute("aria-current");
          }
        }
      } else if (window.scrollY < 100) {
        if (currentHash !== "") {
          currentHash = "";
          for (const l of tocLinks) {
            l.classList.remove("is-active");
            l.removeAttribute("aria-current");
          }
        }
      }
    },
    {
      rootMargin: `-${headerH + 58}px 0px -60% 0px`,
      threshold: 0,
    }
  );
  for (const { heading } of spyTargets) spyObserver.observe(heading);
};
createSpyObserver();

/* ========== 滚动 · 监听与返回 ========== */

updateScrollState();
window.addEventListener("scroll", requestScrollUpdate, { passive: true, signal: globalSignal });
window.addEventListener(
  "resize",
  () => {
    updateHeaderH();
    createSpyObserver();
    requestScrollUpdate();
  },
  { signal: globalSignal }
);
document.fonts?.ready.then(requestScrollUpdate).catch(() => requestScrollUpdate());

backToTop?.addEventListener(
  "click",
  () => {
    /* reducedMotion.matches → auto */
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  },
  { signal: globalSignal }
);

/* ========== 代码块 · 复制 ========== */
// 单委托监听 [data-copy]，以 WeakMap 隔离各按钮的回显定时器，避免并发点击串扰。

const copyTimers = new WeakMap();
const activeCopyButtons = new Set();
// 往返缓存时清理所有待复位的复制按钮定时器，避免 bfcache 复用后文案错位。
window.addEventListener(
  "pagehide",
  () => {
    for (const btn of activeCopyButtons) {
      const t = copyTimers.get(btn);
      if (t) window.clearTimeout(t);
    }
    activeCopyButtons.clear();
  },
  { signal: globalSignal }
);
const fallbackCopy = (text) => {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  area.remove();
  return ok;
};

document.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest("[data-copy]");
    if (!button || button.hidden) return;
    const pre = button.closest(".code-block")?.querySelector("pre");
    if (!pre) return;
    const text = pre.textContent ?? "";
    if (!button.dataset.origLabel) button.dataset.origLabel = button.textContent || "复制";
    const origLabel = button.dataset.origLabel;

    const doCopy = () => {
      const clip = navigator.clipboard?.writeText
        ? navigator.clipboard.writeText(text)
        : Promise.reject(new Error("no clipboard"));
      return clip.catch(() => {
        if (fallbackCopy(text)) return Promise.resolve();
        return Promise.reject(new Error("copy failed"));
      });
    };

    doCopy()
      .then(() => {
        const prev = copyTimers.get(button);
        if (prev) window.clearTimeout(prev);
        button.textContent = "已复制";
        button.classList.add("is-copied");
        const timer = window.setTimeout(() => {
          button.textContent = origLabel;
          button.classList.remove("is-copied");
          copyTimers.delete(button);
          activeCopyButtons.delete(button);
        }, 1600);
        copyTimers.set(button, timer);
        activeCopyButtons.add(button);
      })
      .catch(() => {
        const prev = copyTimers.get(button);
        if (prev) window.clearTimeout(prev);
        button.textContent = "复制失败";
        button.classList.add("is-copied");
        const timer = window.setTimeout(() => {
          button.textContent = origLabel;
          button.classList.remove("is-copied");
          copyTimers.delete(button);
          activeCopyButtons.delete(button);
        }, 1600);
        copyTimers.set(button, timer);
        activeCopyButtons.add(button);
      });
  },
  { signal: globalSignal }
);
// 客户端全文检索：加载索引后在内存中完成分词与权重排序，避免服务端依赖，提升离线可用性。

const searchInput = document.querySelector("#search-input");
const searchResults = document.querySelector("#search-results");
const searchStatus = document.querySelector("#search-status");

if (searchInput && searchResults && searchStatus) {
  const resultList = searchResults.querySelector("ul");
  if (!resultList) {
    console.warn("[search] missing <ul> in #search-results");
  } else {
    let index = [];
    let debounceTimer;
    let currentController = null;
    let currentTimeout = null;

    const normalize = (value) => String(value || "").toLocaleLowerCase("zh-CN");
    // 中文分词：优先 Intl.Segmenter 按词切分，无空格的连续中文亦可拆词；回退空格切分
    const segmenter = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("zh-CN", { granularity: "word" }) : null;
    const tokenize = (query) => {
      const raw = normalize(query.trim());
      if (!raw) return [];
      if (segmenter) {
        const segs = [...segmenter.segment(raw)]
          .filter((s) => s.isWordLike)
          .map((s) => s.segment.trim())
          .filter(Boolean);
        return [...new Set(segs)].slice(0, 20);
      }
      return [...new Set(raw.split(/\s+/).filter(Boolean))].slice(0, 20);
    };
    const prepareItem = (item) => {
      if (!item || typeof item !== "object") return null;
      const url = String(item.url || "");
      if (!url.startsWith("/") || url.startsWith("//")) return null;
      const topics = Array.isArray(item.topics)
        ? item.topics.filter((value) => typeof value === "string")
        : [];
      const tags = Array.isArray(item.tags)
        ? item.tags.filter((value) => typeof value === "string")
        : [];
      return {
        title: String(item.title || ""),
        url,
        description: String(item.description || ""),
        date: String(item.date || ""),
        dateISO: String(item.dateISO || ""),
        topics,
        titleText: normalize(item.title),
        taxonomyText: normalize([...topics, ...tags].join(" ")),
        bodyText: normalize(`${item.description || ""} ${item.content || ""}`),
      };
    };

    /* ========== 搜索 · 匹配与渲染 ========== */

    const renderResults = () => {
      if (!resultList) return;
      const terms = tokenize(searchInput.value);
      resultList.replaceChildren();
      if (!terms.length) {
        searchStatus.textContent = "输入关键词开始搜索。";
        return;
      }

      const matches = index
        .map((item) => {
          let score = 0;
          const matched = terms.every((term) => {
            if (item.titleText.includes(term)) {
              score += 8;
              return true;
            }
            if (item.taxonomyText.includes(term)) {
              score += 5;
              return true;
            }
            if (item.bodyText.includes(term)) {
              score += 1;
              return true;
            }
            return false;
          });
          return matched ? { item, score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      searchStatus.textContent = matches.length
        ? `找到 ${matches.length} 篇相关记录${matches.length > 20 ? "，显示前 20 篇" : ""}。`
        : "没有找到相关记录。";

      const fragment = document.createDocumentFragment();
      matches.slice(0, 20).forEach(({ item }) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.className = "search-result";
        link.href = item.url;

        const heading = document.createElement("h2");
        heading.textContent = item.title;
        const description = document.createElement("span");
        description.textContent = item.description;
        const meta = document.createElement("small");
        const time = document.createElement("time");
        time.dateTime = item.dateISO;
        time.textContent = item.date;
        meta.append(time);
        if (item.topics.length) meta.append(` · ${item.topics.join(" · ")}`);

        link.append(heading, description, meta);
        listItem.append(link);
        fragment.append(listItem);
      });
      resultList.replaceChildren(fragment);
    };

    /* ========== 搜索 · 地址与重试 ========== */

    const getSearchIndexUrl = () => {
      const raw = document.body.dataset.searchIndex;
      if (!raw) {
        console.warn("[search] missing data-search-index");
        return null;
      }
      try {
        const parsed = new URL(raw, window.location.href);
        if (parsed.origin !== window.location.origin) {
          console.warn("[search] cross-origin search index blocked", raw);
          return null;
        }
        return parsed.href;
      } catch (error) {
        console.warn("[search] invalid search index url", raw, error);
        return null;
      }
    };

    let retryBtn = null;
    const hideRetry = () => {
      if (retryBtn) {
        retryBtn.remove();
        retryBtn = null;
      }
    };
    const showRetry = () => {
      if (retryBtn) return;
      retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.textContent = "重试";
      retryBtn.className = "search-retry";
      retryBtn.addEventListener("click", () => {
        hideRetry();
        loadIndex();
      }, { signal: globalSignal });
      searchStatus.after(retryBtn);
    };

    /* ========== 搜索 · 索引请求 ========== */

    const loadIndex = () => {
      const url = getSearchIndexUrl();
      if (!url) {
        searchInput.disabled = true;
        searchStatus.textContent = "搜索索引地址无效，请前往归档页浏览文章。";
        showRetry();
        return;
      }
      if (currentController) currentController.abort();
      if (currentTimeout) window.clearTimeout(currentTimeout);
      currentController = new AbortController();
      currentTimeout = window.setTimeout(() => currentController.abort(), 10000);
      searchStatus.textContent = "正在加载搜索索引。";
      window.addEventListener("pagehide", () => currentController?.abort(), { signal: globalSignal });
      fetch(url, { signal: currentController.signal })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => {
          window.clearTimeout(currentTimeout);
          if (!Array.isArray(data)) throw new TypeError("Invalid search index");
          index = data.map(prepareItem).filter(Boolean);
          searchInput.disabled = false;
          searchStatus.textContent = "输入关键词开始搜索。";
          hideRetry();
          if (searchInput.value.trim()) renderResults();
        })
        .catch((error) => {
          window.clearTimeout(currentTimeout);
          if (error?.name === "AbortError") {
            searchStatus.textContent = "搜索索引加载超时，请重试。";
          } else {
            console.warn("[search] load failed", error);
            searchStatus.textContent = "搜索索引加载失败，请前往归档页浏览文章。";
          }
          searchInput.disabled = true;
          showRetry();
        });
    };

    loadIndex();

    /* ========== 搜索 · 快捷交互 ========== */

    searchInput.addEventListener(
      "input",
      () => {
        window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(renderResults, 120);
      },
      { signal: globalSignal }
    );
    window.addEventListener("pagehide", () => window.clearTimeout(debounceTimer), { signal: globalSignal });
    document.addEventListener(
      "keydown",
      (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          if (searchInput.disabled) return;
          if (searchInput.offsetParent === null) return;
          const target = event.target;
          if (
            target instanceof HTMLElement &&
            (target.matches("input, textarea, select") || target.isContentEditable)
          ) {
            if (target === searchInput) return;
          }
          event.preventDefault();
          searchInput.focus();
        }
      },
      { signal: globalSignal }
    );
  }
}

/* ========== 主题 · 存储与切换 ========== */
// 主题以 html[data-theme] 为单一真相源，localStorage 仅作持久化；首帧已由 head 内联脚本写入，避免闪烁。
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeRoot = document.documentElement;
const THEME_KEY = "ww-theme";
// 同步按钮的 aria-pressed 与视觉下划线，并更新 theme-color 以适配移动端地址栏。
const syncThemeToggle = () => {
  const dark = themeRoot.getAttribute("data-theme") === "dark";
  for (const btn of document.querySelectorAll("[data-theme-toggle]")) {
    btn.setAttribute("aria-pressed", String(dark));
    for (const opt of btn.querySelectorAll(".theme-toggle__opt")) {
      opt.toggleAttribute("data-active", opt.dataset.mode === (dark ? "dark" : "light"));
    }
  }
  themeMeta?.setAttribute("content", dark ? "#14171a" : "#f7f7f4");
};
for (const btn of document.querySelectorAll("[data-theme-toggle]")) {
  btn.addEventListener(
    "click",
    () => {
      const next = themeRoot.getAttribute("data-theme") === "dark" ? "light" : "dark";
      themeRoot.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (error) {
        console.warn("[theme] persist failed", error);
      }
      syncThemeToggle();
    },
    { signal: globalSignal }
  );
}
syncThemeToggle();
window.addEventListener("storage", (event) => {
  if (event.key !== THEME_KEY) return;
  const value = event.newValue;
  if (value === "dark" || value === "light") {
    themeRoot.setAttribute("data-theme", value);
    syncThemeToggle();
  }
});
/* ========== 入场 · 渐进揭示 ========== */
// 滚动入场仅作渐进增强：无 IntersectionObserver 或偏好减少动效时直接显现，避免内容被隐藏。

const revealEls = document.querySelectorAll(".post-row, .featured-post, .section-label");
let revealObserver = null;
const initReveal = () => {
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
  for (const el of revealEls) {
    el.classList.remove("reveal", "is-revealed");
  }
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    for (const el of revealEls) {
      el.classList.add("reveal");
      revealObserver.observe(el);
    }
  } else {
    for (const el of revealEls) {
      el.classList.add("is-revealed");
    }
  }
};
initReveal();
const handleRevealMotionChange = () => initReveal();
reducedMotion.addEventListener("change", handleRevealMotionChange, { signal: globalSignal });
