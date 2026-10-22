export default function RegistrationClosed() {
  return null;
}

export function getServerSideProps() {
  return {
    redirect: {
      destination: '/contact',
      permanent: false,
    },
  };
}
