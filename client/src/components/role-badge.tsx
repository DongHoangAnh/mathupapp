import { GraduationCap, BookOpen, Users } from "lucide-react";

interface RoleBadgeProps {
    role: 'student' | 'teacher' | 'parent';
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function RoleBadge({ role, className = '', size = 'sm' }: RoleBadgeProps) {
    const roleConfig = {
        student: {
            label: 'Học sinh',
            icon: GraduationCap,
            bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            borderColor: 'border-blue-600',
            emoji: '🎓'
        },
        teacher: {
            label: 'Giáo viên',
            icon: BookOpen,
            bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
            borderColor: 'border-purple-600',
            emoji: '👨‍🏫'
        },
        parent: {
            label: 'Phụ huynh',
            icon: Users,
            bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
            borderColor: 'border-orange-600',
            emoji: '👨‍👩‍👧'
        }
    };

    const config = roleConfig[role] || roleConfig.student;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[9px] gap-0.5',
        md: 'px-3 py-1 text-xs gap-1',
        lg: 'px-4 py-1.5 text-sm gap-1.5'
    };

    const iconSizes = {
        sm: 10,
        md: 14,
        lg: 16
    };

    return (
        <div
            className={`
        ${config.bgColor} 
        ${sizeClasses[size]}
        ${className}
        rounded-full 
        text-white 
        font-black 
        uppercase 
        tracking-wider 
        flex 
        items-center 
        justify-center
        shadow-lg
        border-2
        ${config.borderColor}
        whitespace-nowrap
        backdrop-blur-sm
      `}
        >
            <Icon size={iconSizes[size]} strokeWidth={3} />
            <span>{config.label}</span>
        </div>
    );
}
