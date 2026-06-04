import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const results: any = {};

    // 1. Create auth user (this will fail safely if it already exists, or send a confirmation/reset if new)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'leena@alfitrah.com',
      password: 'teacher123',
    });
    results.authStatus = authError ? authError.message : 'Auth user created or reset link sent';

    // 2. Remove any duplicate teacher@... row for Leena
    const { error: delDupError } = await supabase
      .from('users')
      .delete()
      .eq('name', 'Leena Mam')
      .neq('email', 'leena@alfitrah.com');
    results.deleteDuplicateUser = delDupError ? delDupError.message : 'Success';

    // 3. Upsert user row for leena@alfitrah.com
    // We'll try to delete and insert to simulate upsert if there's no unique constraint
    await supabase.from('users').delete().eq('email', 'leena@alfitrah.com');
    const { error: userInsertError } = await supabase.from('users').insert({
      email: 'leena@alfitrah.com',
      name: 'Leena Mam',
      role: 'teacher'
    });
    results.userUpsert = userInsertError ? userInsertError.message : 'Success';

    // 4. Upsert teacher row for leena@alfitrah.com
    await supabase.from('teachers').delete().eq('email', 'leena@alfitrah.com');
    await supabase.from('teachers').delete().eq('name', 'Leena Mam');
    
    const { error: teacherInsertError } = await supabase.from('teachers').insert({
      email: 'leena@alfitrah.com',
      name: 'Leena Mam',
      grades: '["Grade 1", "Grade 2", "Grade 3", "Grade 4"]',
      subjects: '["English", "Maths", "Science"]',
      phone: '0000000000',
      employee_id: 'EMP-LEENA'
    });
    results.teacherUpsert = teacherInsertError ? teacherInsertError.message : 'Success';

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
