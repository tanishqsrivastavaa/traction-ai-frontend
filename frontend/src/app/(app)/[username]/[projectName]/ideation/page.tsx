import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { IdeationClient } from "./ideation-client";

export default async function IdeationPage({
  params,
}: {
  params: Promise<{ username: string; projectName: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  const { username, projectName } = await params;
  return <IdeationClient username={username} projectName={projectName} />;
}
