import Navbar from '@/components/Navbar'

export default function SoaDeploymentPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f9fafb] pt-20 md:pt-24">
      <Navbar />

      <section className="h-[calc(100vh-5rem)] overflow-hidden md:h-[calc(100vh-6rem)]">
        <iframe
          src="/soa-deployment/index.html"
          className="h-full w-full border-0 block"
          title="SOA Deployment Viewer"
        />
      </section>
    </main>
  )
}
