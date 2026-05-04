import React from "react";
import { Card, Accordion, Button } from "flowbite-react";

export default function PrivacyPolicy() {
  const policySections = [
    {
      title: "Information We Collect",
      items: [
        {
          question: "What personal information do we collect?",
          answer:
            "We collect information you provide when registering as a donor, scheduling appointments, or contacting us, such as your name, email, phone number, and health-related details necessary for blood donation eligibility.",
        },
        {
          question: "Do we collect sensitive health information?",
          answer:
            "Yes, we collect health information (e.g., medical history, blood type) to ensure safe blood donation. This data is handled with strict confidentiality and only used for donation purposes.",
        },
        {
          question: "Do we use cookies or tracking technologies?",
          answer:
            "Our website uses cookies to enhance user experience, analyze site usage, and improve our services. You can manage cookie preferences through your browser settings.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      items: [
        {
          question: "How is my information used?",
          answer:
            "We use your information to manage blood donation appointments, verify eligibility, communicate with you about donation events, and improve our services.",
        },
        {
          question: "Do we use data for marketing?",
          answer:
            "We may send you updates about blood drives or donation campaigns, but only with your consent. You can opt out of these communications at any time.",
        },
        {
          question: "How long do we retain your data?",
          answer:
            "We retain your data only as long as necessary for donation purposes or as required by law. You can request deletion of your data, subject to legal obligations.",
        },
      ],
    },
    {
      title: "Data Sharing and Security",
      items: [
        {
          question: "Do we share your information?",
          answer:
            "We do not sell or share your personal information with third parties, except with trusted partners (e.g., blood banks, hospitals) for donation purposes or as required by law.",
        },
        {
          question: "How do we protect your data?",
          answer:
            "We implement industry-standard security measures, including encryption and secure servers, to protect your personal and health information from unauthorized access.",
        },
        {
          question: "What happens in case of a data breach?",
          answer:
            "In the unlikely event of a data breach, we will notify affected users promptly and take necessary steps to mitigate risks, in accordance with applicable laws.",
        },
      ],
    },
    {
      title: "Your Rights and Choices",
      items: [
        {
          question: "What are my rights regarding my data?",
          answer:
            "You have the right to access, correct, or delete your personal information. You can also request a copy of your data or object to certain processing activities.",
        },
        {
          question: "How can I update or delete my information?",
          answer:
            "You can update your information through your account settings or contact us at privacy@blooddonation.org to request changes or deletion.",
        },
        {
          question: "How can I contact you about privacy concerns?",
          answer:
            "For any privacy-related questions, please email us at privacy@blooddonation.org or call +1 (123) 456-7890. We aim to respond within 30 days.",
        },
      ],
    },
  ];

  return (
    <div
      className="py-16 bg-gray-50 min-h-screen"
      style={{
        backgroundImage: "url('/images/blood-donation-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-8 shadow-lg">
          <h1 className="text-4xl font-bold text-center text-red-700 mb-4">
            Privacy Policy
        </h1>
          <p className="text-gray-700 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6">
            {policySections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">
                  {section.title}
                </h2>
                <Accordion>
                  {section.items.map((item, itemIndex) => (
                    <Accordion.Panel key={itemIndex}>
                      <Accordion.Title className="text-gray-800 hover:text-red-600">
                        {item.question}
                      </Accordion.Title>
                      <Accordion.Content>
                        <p className="text-gray-700">{item.answer}</p>
                      </Accordion.Content>
                    </Accordion.Panel>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-700 mb-4">
              If you have any questions about our Privacy Policy, please contact
              us.
            </p>
            <Button color="red">Contact Us</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}