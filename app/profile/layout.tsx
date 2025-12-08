
import {LayoutWithNav} from '../layout-with-nav';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWithNav>{children}</LayoutWithNav>;
}
