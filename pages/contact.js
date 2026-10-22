import FreightLayout, { operationsPhone } from '@/components/freight/FreightLayout';
import manualEnquiry from '@/lib/manualEnquiry.cjs';
import s from '@/styles/Contact.module.css';

const { buildManualEnquiryMailto } = manualEnquiry;

export default function Contact() {
  const openEmailDraft = (event) => {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget).entries());
    window.location.assign(buildManualEnquiryMailto(fields));
  };

  return <FreightLayout
    title="Manual freight enquiry | Midnight Express"
    description="Prepare a road, air or sea freight enquiry for the Midnight Express operations team."
    path="/contact"
  >
    <section className={s.layout}>
      <div className={s.intro}>
        <p className={s.eyebrow}>MANUAL FREIGHT ENQUIRY</p>
        <h1>Tell operations what needs moving.</h1>
        <p>Provide the essential collection, delivery and goods details. We will prepare them as an email for you to review and send to Midnight Express operations.</p>
        <div className={s.steps}>
          <strong>What happens next</strong>
          <ol>
            <li>Complete the freight details.</li>
            <li>Your email app opens with a prepared message.</li>
            <li>Review and send it; operations can then respond manually.</li>
          </ol>
        </div>
        <p className={s.boundary}>This page does not create an automated booking, price, invoice or payment.</p>
        <a className={s.phone} href={operationsPhone}>Urgent requirement? Call operations on 0800 999 1263.</a>
      </div>

      <form className={s.form} onSubmit={openEmailDraft} aria-describedby="submission-note">
        <div className={s.grid}>
          <label>Name<input name="name" autoComplete="name" required /></label>
          <label>Company<input name="company" autoComplete="organization" required /></label>
          <label>Email<input name="replyEmail" type="email" autoComplete="email" required /></label>
          <label>Phone <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" /></label>
          <label>Collection location<input name="origin" autoComplete="street-address" required /></label>
          <label>Delivery location<input name="destination" required /></label>
        </div>
        <label>Goods and load details<textarea name="goods" rows="5" placeholder="Describe the goods, quantity, weight, dimensions and any special handling requirements." required /></label>
        <label>Preferred timing <span>(optional)</span><input name="timing" placeholder="Collection date or delivery deadline" /></label>
        <button type="submit">Open email draft</button>
        <p id="submission-note" className={s.note}>Your enquiry is not submitted until you send the prepared message from your email app.</p>
      </form>
    </section>
  </FreightLayout>;
}

Contact.freightMarketing = true;
