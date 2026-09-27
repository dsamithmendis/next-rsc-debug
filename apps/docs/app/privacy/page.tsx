export default function PrivacyPage() {
  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
      <h1>Privacy</h1>
      <p>Next RSC Debug does NOT record:</p>
      <ul>
        <li>Cookies</li>
        <li>Authorization headers</li>
        <li>Request bodies</li>
        <li>Response bodies</li>
        <li>Passwords or tokens</li>
        <li>Database records</li>
      </ul>
      <p>Query strings are stripped by default.</p>
    </article>
  );
}
