/* eslint-disable react/no-unescaped-entities */
import LegalLayout from '../../components/LegalLayout';

const now = '31 August 2026';

const Section = ({ h, children }) => (
  <>
    <h2 style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 700, margin: '26px 0 8px' }}>{h}</h2>
    <div style={{ marginBottom: 4 }}>{children}</div>
  </>
);

const P = ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>;
const Ul = ({ children }) => <ul style={{ padding: 0, margin: '0 0 12x' }}>{children}</ul>;
const Li = ({ children }) => <li style={{ marginBottom: 6, marginLeft: 20 }}>{children}</li>;

const CONTENT = {
  'privacy-policy': {
    title: 'Privacy Policy',
    body: (
      <>
        <P>LearnPath AI ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have. Because LearnPath AI is a student project by Team NightCoders (JECRC University), it operates primarily as a demonstration and is not a commercial data processor.</P>
        <Section h="1. Information We Collect">
          <Ul>
            <Li><b>Learner profile</b> — information you provide during onboarding, including goals, experience level, interests and previous courses.</Li>
            <Li><b>Progress data</b> — courses you mark as complete and overall learning progress.</Li>
            <Li><b>Usage data</b> — pages visited and interactions to improve the experience.</Li>
          </Ul>
        </Section>
        <Section h="2. How We Use Your Information">
          <P>We use this information solely to generate personalized learning paths, track progress, and improve the product. We do not sell your personal data to third parties.</P>
        </Section>
        <Section h="3. Storage & Security">
          <P>For the public demo, profile and progress data are stored locally in your browser (localStorage) so that no personal information leaves your device. Where a backend is configured, data is used only to provide chat-based explanations.</P>
        </Section>
        <Section h="4. Your Rights">
          <P>You may clear your locally stored data at any time through your browser settings, which removes all learner data we have stored on your device.</P>
        </Section>
        <Section h="5. Contact">
          <P>For privacy questions, contact the team at <b>bhagyanshchandel3567@gmail.com</b>.</P>
        </Section>
      </>
    ),
  },
  'terms-of-service': {
    title: 'Terms of Service',
    body: (
      <>
        <P>By accessing and using LearnPath AI, you agree to these Terms of Service. If you do not agree, please do not use the service.</P>
        <Section h="1. Use of Service">
          <P>LearnPath AI provides personalized learning-path recommendations for educational purposes. It is provided as a prototype by Team NightCoders and should not be treated as certified academic or career advice.</P>
        </Section>
        <Section h="2. Acceptance">
          <P>You are responsible for the accuracy of the information you provide in your learner profile.</P>
        </Section>
        <Section h="3. Intellectual Property">
          <P>All code, design and content of this project belong to the team and contributors. You may not redistribute or resell the solution without permission.</P>
        </Section>
        <Section h="4. Limitation of Liability">
          <P>The service is provided "as is" without warranties of any kind. The team is not liable for any outcomes arising from use of the learning paths.</P>
        </Section>
      </>
    ),
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    body: (
      <>
        <P>LearnPath AI uses minimal local storage to remember your theme preference, learner profile and progress. We do not use third-party advertising cookies.</P>
        <Section h="What we store locally">
          <Ul>
            <Li>Theme preference (dark/light)</Li>
            <Li>Learner profile created during onboarding</Li>
            <Li>Completed-courses progress data</Li>
          </Ul>
        </Section>
        <Section h="Managing local storage">
          <P>You can clear this data at any time via your browser&apos;s privacy settings. No cookies are required to view the public pages.</P>
        </Section>
      </>
    ),
  },
  'disclaimer': {
    title: 'Disclaimer',
    body: (
      <>
        <P>LearnPath AI generates personalized learning recommendations using algorithmic skill-gap analysis. The recommendations are educational suggestions and do not constitute professional career, academic or financial advice.</P>
        <P>All content is provided "as is." The team does not guarantee specific outcomes, such as job placement, certification, or skill mastery, as a result of following a recommended learning path.</P>
      </>
    ),
  },
  'accessibility': {
    title: 'Accessibility Statement',
    body: (
      <>
        <P>We aim to make LearnPath AI usable by as many people as possible. The interface supports high-contrast theming (dark/light) and is built to be navigable via keyboard and assistive technologies.</P>
        <Section h="What we are doing">
          <Ul>
            <Li>Semantic HTML and ARIA labels on interactive controls</Li>
            <Li>Sufficient color contrast for text and UI elements</Li>
            <Li>Responsive layouts for mobile and desktop</Li>
          </Ul>
        </Section>
        <Section h="Feedback">
          <P>If you encounter accessibility issues, please contact bhagyanshchandel3567@gmail.com.</P>
        </Section>
      </>
    ),
  },
  'data-processing': {
    title: 'Data Processing Agreement',
    body: (
      <>
        <P>This Data Processing Agreement describes how LearnPath AI processes learner data. As a prototype, most data is processed locally in the browser.</P>
        <Section h="Data we process">
          <Ul>
            <Li>Learner profile information (goals, skills, interests)</Li>
            <Li>Progress and completion data</Li>
          </Ul>
        </Section>
        <Section h="Where data resides">
          <P>In the public demo, data resides locally on the user&apos;s device. No personal data is sold or shared with unrelated third parties.</P>
        </Section>
      </>
    ),
  },
  'security': {
    title: 'Security Policy',
    body: (
      <>
        <P>We take reasonable measures to protect the LearnPath AI service and its users.</P>
        <Section h="Best practices">
          <Ul>
            <Li>HTTPS encryption for all traffic</Li>
            <Li>Minimal data collection — most data stays on the user&apos;s device</Li>
            <Li>Regular review of dependencies for known vulnerabilities</Li>
          </Ul>
        </Section>
        <Section h="Reporting">
          <P>Report security concerns to bhagyanshchandel3567@gmail.com.</P>
        </Section>
      </>
    ),
  },
  'help-center': {
    title: 'Help Center',
    body: (
      <>
        <P>Welcome to the LearnPath AI Help Center. Here are answers to common questions.</P>
        <Section h="How do I create a learning path?">
          <P>Open the Assistant and describe your goal in natural language. Complete the onboarding to build your profile, then review your personalized path on the Path page.</P>
        </Section>
        <Section h="How is my path generated?">
          <P>Our engine analyzes your skill gap between your current level and your target, then builds a sequenced roadmap of phases, courses, projects and assessments. It works without any external AI service.</P>
        </Section>
        <Section h="How do I track progress?">
          <P>Use the Dashboard to view overall progress, skill readiness and milestones. Mark courses complete to update your progress bar.</P>
        </Section>
        <Section h="Still need help?">
          <P>Contact the team at bhagyanshchandel3567@gmail.com.</P>
        </Section>
      </>
    ),
  },
};

export const getStaticPaths = () => {
  return {
    paths: Object.keys(CONTENT).map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps = async (context) => {
  const { params } = context;
  return { props: { slug: params.slug } };
};

export default function LegalPage({ slug }) {
  const data = CONTENT[slug];
  return (
    <LegalLayout title={data ? data.title : 'Page not found'} lastUpdated={data ? now : null}>
      {data ? (
        data.body
      ) : (
        <p>This page could not be found. Please use the navigation to explore the site.</p>
      )}
    </LegalLayout>
  );
}