"use client";
import { FC, ReactNode } from "react";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import scss from "./Layout.module.scss";

interface ILayoutProps {
  children: ReactNode;
}

const Layout: FC<ILayoutProps> = ({ children }) => {
  return (
    <>
      <div className={scss.Layout}>
        {/* <Header /> */}
        <main>{children}</main>
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Layout;
