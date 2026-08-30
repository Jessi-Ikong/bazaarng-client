import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import Footer from '../common/Footer';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex gap-6 items-start">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
