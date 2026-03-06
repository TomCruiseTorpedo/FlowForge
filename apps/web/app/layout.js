export const metadata = {
  title: "FlowForge",
  description: "Forge automations from plain English.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
