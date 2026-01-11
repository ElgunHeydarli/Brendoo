import React, { ChangeEvent, FormEvent, SetStateAction } from 'react'
import { MdClose } from "react-icons/md";
import { TranslationsKeys } from '../setting/Types';
import GETRequest from '../setting/Request';
import { useParams } from 'react-router-dom';

export interface Rate {
    id: number;
    rate: number;
    icon: string;
    iconFill: string;
}

interface Props {
    setOpenRateModal: React.Dispatch<SetStateAction<number | null>>;
}

const DelayedModal: React.FC<Props> = ({ setOpenRateModal }) => {
    const RateData: Rate[] = [
        { id: 1, icon: "/starempty.svg", iconFill: "/starfill.svg", rate: 1 },
        { id: 2, icon: "/starempty.svg", iconFill: "/starfill.svg", rate: 2 },
        { id: 3, icon: "/starempty.svg", iconFill: "/starfill.svg", rate: 3 },
        { id: 4, icon: "/starempty.svg", iconFill: "/starfill.svg", rate: 4 },
        { id: 5, icon: "/starempty.svg", iconFill: "/starfill.svg", rate: 5 },
    ];

    const { lang = 'ru' } = useParams<{ lang: string }>();
    const { data: translation } =
        GETRequest<TranslationsKeys>(`/translates`, 'translates', [lang]);
    const [showDelayedModal] = React.useState<boolean>(true);
    const [selectedRate, setSelectedRate] = React.useState<number | null>(null);
    const [hoveredRate, setHoveredRate] = React.useState<number | null>(null);

    const handleRateClick = (rate: number) => {
        setSelectedRate(rate);
    };

    const [data, setData] = React.useState<{ note: string; rating: string }>({ note: "", rating: "" });


    const modalRef = React.useRef<HTMLDivElement | null>(null);
    const outsideClick = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current?.contains(e.target as Node)) {
            setOpenRateModal(null);
        }
    }

    React.useEffect(() => {
        window.addEventListener("mousedown", outsideClick);
        return () => window.removeEventListener("mousedown", outsideClick);
    }, []);

    return (
        <section ref={modalRef} className={`delayed-modal ${showDelayedModal ? "active" : ""}`}>
            <div className="close-area">
                <MdClose className='close-icon-mini' onClick={() => setOpenRateModal(null)} />
            </div>
            <form
                acceptCharset='UTF-8'
                className="content-modal"
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                }}
            >
                <div className="top-title-modal">
                    <h2>{translation?.mehsulu_deyerlendir || ""}</h2>
                </div>
                <div className="rate">
                    {RateData.map((rate) => (
                        <div
                            key={rate.id}
                            className="star-icon"
                            onMouseEnter={() => setHoveredRate(rate.id)}
                            onMouseLeave={() => setHoveredRate(null)}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                handleRateClick(rate.id);
                                setData((prevData: any) => ({ ...prevData, rating: String(rate.id) }))
                            }}
                        >
                            <img src={rate.id <= Math.max(hoveredRate ?? 0, selectedRate ?? 0) ? rate.iconFill : rate.icon} alt="star" />
                        </div>
                    ))}
                </div>
                <textarea
                    name="note"
                    placeholder={translation?.reyiniz_key || ""}
                    value={data.note}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData((prevData: any) => ({ ...prevData, note: e.target.value }))}
                />
                <button type='submit' className='submit-btn'>
                    {translation?.gonder_key || ""}
                </button>
            </form>
        </section>
    );
};

export default DelayedModal;
