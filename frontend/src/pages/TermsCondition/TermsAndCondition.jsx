import React from "react";

const TermsAndPrivacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#C3E8FF] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div>
        <img src="/logo.png" alt="logo" className="w-20 mb-2" />
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-white shadow-md p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Terms and Conditions
          </h1>
          <p className="text-gray-600">Last Updated: 27-08-2025</p>

          <p className="text-gray-700 leading-relaxed">
            Welcome to KKD. By downloading, installing, or using this mobile
            application, you agree to comply with and be bound by these Terms
            and Conditions. Please read them carefully before using the app.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">1. Eligibility</h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>Users must be 16 years or older to create an account.</li>
              <li>
                By using this app, you confirm that the information provided is
                accurate, complete, and updated.
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that
                provide false information.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              2. Account and Login
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>You must register using a valid email ID.</li>
              <li>
                Users are responsible for maintaining the confidentiality of
                their login credentials.
              </li>
              <li>
                Any activity under your account will be considered your
                responsibility.
              </li>
              <li>
                If you suspect unauthorized use of your account, you must notify
                us immediately.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">3. App Features</h2>
            <p className="text-gray-700 leading-relaxed">
              The application provides the following services:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>User Registration & Login using email.</li>
              <li>
                Profile Management where users can upload personal details.
              </li>
              <li>
                Product Browsing to explore available products in the shop.
              </li>
              <li>Search Functionality for products.</li>
              <li>Offers & Discounts visibility.</li>
              <li>
                QR Code Scanning to collect loyalty points from shop owners.
              </li>
              <li>
                Points System where collected points can be redeemed for
                purchases.
              </li>
              <li>
                PDF & Image Upload feature for users to store necessary files.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              4. Use of QR Codes & Points System
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>QR codes are provided by shop owners only.</li>
              <li>
                Users must scan genuine QR codes; scanning fake/unauthorized
                codes is strictly prohibited.
              </li>
              <li>
                Points collected are non-transferable, have no cash value, and
                can only be redeemed within the app.
              </li>
              <li>
                We are not responsible if a shop refuses redemption of points or
                changes its offers.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              5. Content Upload (PDF/Image)
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>
                Users can upload PDFs or images only if they own the rights to
                those files.
              </li>
              <li>
                Uploading illegal, copyrighted, offensive, or harmful content is
                strictly prohibited.
              </li>
              <li>Any violation may lead to immediate account suspension.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              6. User Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed">Users agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>
                Use the app for fraudulent, illegal, or unauthorized purposes.
              </li>
              <li>
                Upload or share harmful files, viruses, or malicious code.
              </li>
              <li>Attempt to hack, reverse engineer, or misuse the app.</li>
              <li>Impersonate other users or provide false details.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              7. Offers & Products
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>The offers displayed are provided by shops/vendors.</li>
              <li>
                We are not responsible for the quality, guarantee, warranty, or
                delivery of products.
              </li>
              <li>
                Any disputes regarding purchases should be resolved directly
                with the shop.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">8. Data Privacy</h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>
                We collect minimal personal details (like email, name, uploaded
                documents) for account management.
              </li>
              <li>Your data will not be sold to third parties.</li>
              <li>
                However, we may share information with law enforcement if
                legally required.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              9. Payments & Withdrawals
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>
                Points are for shop redemption only and cannot be exchanged for
                real money.
              </li>
              <li>
                Withdrawal means you can redeem points in shops only, not via
                bank transfer or online payment.
              </li>
              <li>
                We reserve the right to modify or discontinue the point system
                at any time.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              10. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We provide the app “as is” without any warranties. We are not
              liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>Errors in offers or product listings.</li>
              <li>Data loss due to technical issues.</li>
              <li>Any damages caused by third-party shops or vendors.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">11. Termination</h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>
                We may suspend or terminate user accounts for violating these
                terms.
              </li>
              <li>
                Upon termination, all points/rewards associated with the account
                will be forfeited.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              12. Modifications
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>
                We reserve the right to modify these Terms and Conditions at any
                time.
              </li>
              <li>
                Updated terms will be notified to users via app updates or
                website announcements.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              13. Governing Law
            </h2>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed">
              <li>These Terms are governed by the laws of India.</li>
              <li>
                Any disputes shall be handled under the jurisdiction of local
                courts.
              </li>
            </ul>
          </section>
          <div className="mt-10 text-sm text-gray-700 leading-relaxed">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please
              contact us:
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:vinay07wasom@gmail.com"
                className="text-blue-600 underline"
              >
                vinay07wasom@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;
