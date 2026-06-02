"use server";
import { ISession } from "@/app/api/quiz/instructor/route";
import customeAuth from "../customeAuth/customeAuth";

export const checkIsAdminInstructor = async () => {
  const session = (await customeAuth()) as ISession;
  if (!session || !["admin", "instructor"].includes(session?.user?.role))
    return false;
  return true;
};
