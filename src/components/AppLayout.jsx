import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

function AppLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default AppLayout;
