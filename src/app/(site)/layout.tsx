"use client";
import Layout from "@/components/layout/Layout";
import { FC, ReactNode } from "react";

interface IlayoutProps {
  children: ReactNode;
}

const layout: FC<IlayoutProps> = ({ children }) => {
  return <Layout>{children} </Layout>;
};

export default layout;
