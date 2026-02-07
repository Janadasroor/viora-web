import style from "../Title.module.css";

interface TitleProps {
    title: string;
    extraClass?: string
}
export default function Title({ title, extraClass }: TitleProps) {
    return (
        <h1 className={`${style.title} ${extraClass || ""}`}>{title}</h1>
    )
}