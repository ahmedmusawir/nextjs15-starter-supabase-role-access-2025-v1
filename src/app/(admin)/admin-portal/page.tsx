import AdminPortalPageContent from "./AdminPortalPageContent";

interface Props {
  searchParams: { page?: string };
}

const AdminPortal = ({ searchParams }: Props) => {
  const page = Number(searchParams.page) || 1;
  return <AdminPortalPageContent page={page} />;
};

export default AdminPortal;
