import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'; 
export async function getSessionUser() {
    const session = await  getServerSession(authOptions);
    if(!session?.user?.email){
        console.warn('セッションにメールアドレスが存在しません');
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where:{email:session.user.email},
            select:{
                id:true,
                name:true,
                email:true,
            },
        });

        if(!user){
            console.warn('該当ユーザーが存在しません');
            return null;
        }
        return user;
    } catch (error) {
        console.error("getSessionUser エラー:", error);
    }
}