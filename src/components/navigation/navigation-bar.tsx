import { serverToApi } from "@/lib/backend-v2";
import { NavBarItem, UserWidget } from "./navigation-bar-client";
import { MenuItem } from "@/lib/types";
import { getCurrentUser } from "@/providers/auth-provider";
import Logo from "@/media/logo";
import { PAGE_NAME } from "@/lib/util";
import { LanguageSelector } from "./language-selector";

export async function NavBar() {
  const result = await serverToApi<MenuItem[]>("pages");
  const user = await getCurrentUser();
  const menuItems = result.ok && result.hasBody ? result.data : [];
  return (
    <>
      <nav className="flex items-center gap-4 px-4 py-2 lg:gap-6">
        <Logo size={80} />
        <h1 className="whitespace-nowrap font-bold sm:text-3xl">{PAGE_NAME}</h1>
        <div className="ml-auto flex flex-row-reverse lg:flex-row">
          {/* Hamburger */}
          <label
            aria-controls="menu"
            className="peer z-20 block cursor-pointer p-4 lg:hidden"
          >
            <input
              type="checkbox"
              aria-controls="menu"
              id="hamburger"
              className="peer hidden"
            />
            <div className="mb-1 w-6 transform rounded-full bg-primary pt-1 transition-transform peer-checked:translate-y-2 peer-checked:-rotate-45"></div>
            <div className="mb-1 w-6 rounded-full bg-primary pt-1 opacity-100 transition-opacity peer-checked:opacity-0"></div>
            <div className="w-6 transform rounded-full bg-primary pt-1 transition-transform peer-checked:-translate-y-2 peer-checked:rotate-45"></div>
          </label>
          {/* Click outside menu to hide */}
          <label
            htmlFor="hamburger"
            aria-controls="menu"
            className="pointer-events-none fixed left-0 top-0 h-[100vh] w-[100vw] opacity-0 backdrop-blur-[6px] transition-opacity duration-300 peer-has-[:checked]:pointer-events-auto peer-has-[:checked]:opacity-50 lg:hidden"
          ></label>
          {/* Menu */}
          <ul className="invisible absolute right-0 top-0 z-10 w-full origin-top-right scale-[25%] transform select-none items-center rounded-b-lg border-0 border-b-2 border-background-soft bg-background pb-4 opacity-0 shadow-lg shadow-background-strong transition-[opacity,transform,visibility] duration-300 peer-has-[:checked]:visible peer-has-[:checked]:scale-100 peer-has-[:checked]:opacity-100 sm:right-10 sm:top-5 sm:w-[50%] sm:rounded-lg sm:border-2 sm:border-solid lg:visible lg:static lg:flex lg:w-full lg:transform-none lg:border-none lg:bg-transparent lg:opacity-100 lg:shadow-none">
            <div className="mt-5 sm:hidden">
              <UserWidget user={user} />
            </div>
            {menuItems
              .filter((item) => user?.admin || !item.adminOnly)
              .map((item, index) => (
                <li className="p-4 text-center" key={index}>
                  <NavBarItem item={item} />
                </li>
              ))}
            <LanguageSelector />
          </ul>
          <div className="hidden sm:block">
            <UserWidget user={user} />
          </div>
        </div>
      </nav>
      <hr />
    </>
  );
}