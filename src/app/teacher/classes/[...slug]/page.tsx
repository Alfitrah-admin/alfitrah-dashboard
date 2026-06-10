import { redirect, notFound } from 'next/navigation';

export default async function CatchAll({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  
  if (!slug || slug.length === 0) {
    redirect('/teacher');
  }

  const id = slug[0]; // grade slug, e.g. 'grade-4'
  const subjectPart = slug[1]; // may be undefined or a combined encoded string

  if (!id) return notFound();

  if (!subjectPart) {
    // no subject provided — go to class page
    redirect(`/teacher/classes/${id}`);
  }

  try {
    // decode and split combined subject names by comma or " and "
    const decoded = decodeURIComponent(subjectPart);
    const parts = decoded.split(/,\s*| and | & /i).map(p => p.trim()).filter(Boolean);
    const first = parts[0] || '';
    const subjectSlug = first.toLowerCase().replace(/\s+/g, '-');
    redirect(`/teacher/classes/${id}/${subjectSlug}`);
  } catch (e) {
    // on error, fallback to class page
    redirect(`/teacher/classes/${id}`);
  }
}
