import { useRouter } from 'next/router';

export default function Finish() {
  const r = useRouter();
  const message = r.query.message;

  return (
    <>
      <h1>Finish: {message}</h1>
    </>
  );
}
