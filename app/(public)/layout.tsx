import Footer from "@/components/layout/footer"
import Navbar from "@/components/layout/navbar"

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="min-h-[60svh]">{children}</main>
      <Footer />
    </>
  )
}
