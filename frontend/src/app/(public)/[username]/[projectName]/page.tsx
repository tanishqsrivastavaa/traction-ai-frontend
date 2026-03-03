import { PublicShareClient } from "./share-client";

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ username: string; projectName: string }>;
}) {
  const { username, projectName } = await params;
  return <PublicShareClient username={username} projectName={projectName} />;
}
