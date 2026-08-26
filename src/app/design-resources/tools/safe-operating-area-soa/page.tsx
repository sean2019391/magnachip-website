import NotionLayout from '@/components/NotionLayout';

export default function SoaDeploymentPage() {
  return (
    <NotionLayout title="Safe Operating Area (SOA)">
      <section className="h-[calc(100vh-5rem)] overflow-hidden md:h-[calc(100vh-6rem)]">
        <iframe
          src="/soa-deployment/index.html"
          className="h-full w-full border-0 block"
          title="SOA Deployment Viewer"
        />
      </section>
    </NotionLayout>
  );
}
