import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  Leaf,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-newsletter">
          <div className="footer-title">
            <span className="logo-mark">
              <Leaf size={19} />
            </span>
            <span>
              fresh<span>cart</span>
            </span>
          </div>
          <h2>Good food, delivered fresh.</h2>
          <p>
            Thoughtful picks for your everyday life, delivered right to your
            door.
          </p>
          <a className="newsletter-form" href="mailto:support@freshcart.com">
            <Mail size={17} />
            <span>Questions? We&apos;re happy to help.</span>
            <span className="newsletter-button">
              <ArrowRight size={18} />
            </span>
          </a>
        </div>
        <div className="footer-links">
          <div>
            <h3>Shop</h3>
            <Link href="/products">All products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/brands">Our brands</Link>
          </div>
          <div>
            <h3>Customer care</h3>
            <Link href="/orders">Order history</Link>
            <Link href="/cart">Your cart</Link>
            <Link href="/login">My account</Link>
          </div>
          <div>
            <h3>Get in touch</h3>
            <a href="mailto:support@freshcart.com">
              <Mail size={15} /> support@freshcart.com
            </a>
            <a href="tel:+201001234567">
              <Phone size={15} /> +20 (100) 123-4567
            </a>
            <span className="social-links">
              <a href="https://instagram.com" aria-label="Instagram">
                <AtSign size={17} />
              </a>
              <a href="https://facebook.com" aria-label="Facebook">
                <MessageCircle size={17} />
              </a>
            </span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="shell">
          <span>
            © {new Date().getFullYear()} FreshCart. Made for everyday living.
          </span>
          <span>Secure checkout · Cash on delivery available</span>
        </div>
      </div>
    </footer>
  );
}
