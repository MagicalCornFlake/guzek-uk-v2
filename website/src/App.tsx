import React, { useState, useEffect, MouseEvent } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import TRANSLATIONS from "./translations";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import PageTemplate from "./pages/PageTemplate";
import ErrorPage from "./pages/ErrorPage";
import { getCache } from "./backend";
import Profile from "./pages/Profile";
import PipeDesigner from "./pages/PipeDesigner";
import LoadingScreen from "./components/LoadingScreen";
import "./styles/styles.css";
import "./styles/forms.css";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import { ErrorCode, Language, MenuItem, User } from "./models";
import ContentManager from "./pages/ContentManager";
import { getDuration, PAGE_NAME, tryFetch } from "./util";

/** When set to `true`, doesn't remove caches whose creation date is unknown. */
const IGNORE_INVALID_RESPONSE_DATES = false;

export default function App() {
  const [userLanguage, setUserLanguage] = useState<Language>(Language.EN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [reload, setReload] = useState(true);

  function setLanguage(langString: string) {
    if (!(langString in Language)) {
      throw Error("Invalid language name.");
    }
    const newLang = Language[langString as keyof typeof Language];
    localStorage.setItem("userLanguage", langString);
    setUserLanguage(newLang);
  }

  useEffect(() => {
    // Remove outdated caches
    (async () => {
      const defaultData: { [endpoint: string]: number } = {};
      const updated = await tryFetch("updated", {}, defaultData, false);
      const updatedEndpoints = new Set();
      const cache = await getCache();
      const cachedResponses = await cache.matchAll();
      for (let i = 0; i < cachedResponses.length; i++) {
        const res = cachedResponses[i];
        console.info(
          "Checking cached response",
          i + 1,
          "/",
          cachedResponses.length,
          res.url,
          // Object.fromEntries(res.headers.entries()),
          "..."
        );
        const resTimestamp = parseInt(res.headers.get("Pragma") ?? "0");
        const url = new URL(res.url);
        // Extract the base path (only first subdirectory of URL path)
        const [_, endpoint] = /^\/([^\/]*)(?:\/.*)?$/.exec(url.pathname) ?? [];
        if (!endpoint) continue;
        console.debug(
          "Cache date:",
          resTimestamp,
          `| Endpoint '${endpoint}' last updated:`,
          updated[endpoint]
        );
        if (
          resTimestamp > updated[endpoint] ||
          (IGNORE_INVALID_RESPONSE_DATES && !resTimestamp)
        ) {
          const diff = getDuration(resTimestamp - updated[endpoint]);

          console.log(
            "Cache was created",
            diff.formatted,
            "after the last change on the server."
          );
          continue;
        }
        updatedEndpoints.add(endpoint);
        const deleted = await cache.delete(res.url);
        console.info(
          "Deleted cache",
          res.url,
          (deleted ? "" : "UN") + "SUCCESSFULLY"
        );
      }
      if (updatedEndpoints.size > 0) {
        console.debug("Updated endpoints:", updatedEndpoints);
        setReload(true);
      } else {
        console.debug("All cached responses are up-to-date.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!reload) return;

    setReload(false);

    // Retrieve the menu items from the API
    (async () => {
      const data = await tryFetch("pages", {}, [] as MenuItem[]);
      setMenuItems(data);
    })();
  }, [reload]);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (currentUser) {
      if (!localUser) {
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } else if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    }
  }, [currentUser]);

  useEffect(() => {
    /** Removes the given search parameter from the client-side URL. */
    function removeSearchParam(param: string) {
      const oldValue = searchParams.get(param);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(param);
      setSearchParams(newSearchParams);
      return oldValue || "";
    }
    // If the URL contains the lang parameter, clear it
    const lang = removeSearchParam("lang").toUpperCase();
    try {
      // Set the page content to the translations corresponding to the lang parameter
      setLanguage(lang);
    } catch {
      // The search parameter language was invalid or not set
      const prevLang = localStorage.getItem("userLanguage");
      if (!prevLang || prevLang === "undefined") return;
      setLanguage(prevLang);
    }
  }, [searchParams]);

  /** Event handler for when the user selects one of the lanugage options. */
  function changeLang(evt: MouseEvent<HTMLButtonElement>) {
    evt.preventDefault();
    // Get the button text and remove whitespaces as well as Non-Breaking Spaces (&nbsp;)
    const button = evt.target as HTMLButtonElement;
    const elemText = button.textContent || button.innerText;
    const lang = elemText.replace(/[\s\u00A0]/, "");
    try {
      setLanguage(lang);
    } catch (error) {
      console.error(error as Error);
    }
  }

  const pageContent = TRANSLATIONS[userLanguage];
  if (!pageContent || !menuItems) {
    return <LoadingScreen text={`${pageContent.loading} ${PAGE_NAME}`} />;
  }

  return (
    <div className="App">
      <NavigationBar
        data={pageContent}
        selectedLanguage={userLanguage}
        changeLang={changeLang}
        menuItems={menuItems.filter((item) => !item.adminOnly)}
        user={currentUser}
      />
      <Routes>
        {menuItems
          .filter((item) => item.shouldFetch)
          .map((item, idx) => (
            <Route
              key={idx}
              path={item.url}
              element={
                <PageTemplate
                  reload={reload}
                  pageData={item}
                  lang={userLanguage}
                />
              }
            />
          ))}
        <Route
          path="profile"
          element={
            <Profile
              data={pageContent}
              user={currentUser}
              setUser={setCurrentUser}
            />
          }
        />
        <Route
          path="login"
          element={
            <LogIn
              data={pageContent}
              user={currentUser}
              setUser={setCurrentUser}
            />
          }
        />
        <Route
          path="signup"
          element={
            <SignUp
              data={pageContent}
              user={currentUser}
              setUser={setCurrentUser}
            />
          }
        />
        <Route
          path="content-manager"
          element={
            <ContentManager
              data={pageContent}
              user={currentUser}
              menuItems={menuItems}
            />
          }
        />
        <Route
          path="*"
          element={
            <ErrorPage pageData={pageContent.error[ErrorCode.NotFound]} />
          }
        />
      </Routes>
      <Footer data={pageContent} />
    </div>
  );
}
