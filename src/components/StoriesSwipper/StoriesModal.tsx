import React, { useState, useEffect, useRef, type SetStateAction } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6"
import { StoriesInterface } from '../Header/story';
import { useNavigate, useParams } from 'react-router-dom';
import ROUTES from '../../setting/routes';

interface Props {
    isActiveStory: StoriesInterface;
    setActiveStory: React.Dispatch<SetStateAction<number | null>>;
    allStories: StoriesInterface[];
}

const StoriesModal: React.FC<Props> = ({ isActiveStory, setActiveStory, allStories }) => {

    const { lang = "az" } = useParams();

    const navigate = useNavigate();
    const filteredStories = allStories;

    const clickedIndex = filteredStories.findIndex(
        (story) => story.id === isActiveStory?.id
    );

    const [currentSlide, setCurrentSlide] = useState(clickedIndex);

    const swiperRef = useRef<any>(null);
    const swiperRefs = useRef<{ [key: number]: any }>({});

    const handlePrev = (id: number) => {
        swiperRefs.current[id]?.slidePrev();
    };

    const handleNext = (id: number) => {
        swiperRefs.current[id]?.slideNext();
    };

    const modalRef = useRef<any>(null);
    useEffect(() => {
        const outsideClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setActiveStory(null);
            }
        };
        document.addEventListener("mousedown", outsideClick);
        return () => document.removeEventListener("mousedown", outsideClick);
    }, []);

    useEffect(() => {
        if (swiperRef && swiperRef.current) {
            swiperRef.current.swiper.slideTo(currentSlide, 300);
        }
    }, [currentSlide]);

    const handleSlideChange = (swiper: any) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const handleClickedSlide = (i: number) => {
        if (swiperRef.current?.swiper) {
            swiperRef.current.swiper.slideTo(i, 300);
            setCurrentSlide(i);
        }
    };


    return (
        <div className='story-modal-overlay'>
            <div className="story-modal">
                <IoCloseSharp className='close-icon' onClick={() => setActiveStory(null)} />
                <div className="wrapper-carousel" ref={modalRef}>
                    <Swiper
                        ref={swiperRef}
                        onSlideChange={handleSlideChange}
                        centeredSlides={true}
                        initialSlide={currentSlide}
                        breakpoints={{
                            1800: { slidesPerView: 5 },
                            1360: { slidesPerView: 4 },
                            968: { slidesPerView: 3 },
                            768: { slidesPerView: 1.6 },
                        }}
                        spaceBetween={50}
                        loop={false}
                    >
                        {filteredStories.map((story, i) => (
                            <SwiperSlide key={story.id} onClick={() => handleClickedSlide(i)}>
                                {story.products && story.products.length > 0 ? (
                                    <Swiper
                                        nested={true}
                                        spaceBetween={8}
                                        slidesPerView={1}
                                        onSwiper={(swiper) => (swiperRefs.current[story.id] = swiper)}
                                    >
                                        {story.products.map((p: any) => (
                                            <SwiperSlide key={p.id}>
                                                <img src={p.image} alt={`${p.id}-image`} />
                                                <div className="description-product">
                                                    <div className="left">
                                                        <h3 className='product-title'>{p.title}</h3>
                                                        <h4 className='product-price'>{p.price}</h4>
                                                    </div>
                                                    <div
                                                        className='c-button'
                                                        onClick={() => {
                                                            navigate(
                                                                `/${lang}/${ROUTES.product[lang as keyof typeof ROUTES.product]}/${p?.slug[lang as keyof typeof p.slug]}`
                                                            )
                                                        }}
                                                    >
                                                        {lang === "en" ? "Buy now" : "İndi al"}
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                        <div className="custom-buttons">
                                            <button onClick={() => handlePrev(story.id)}>
                                                <FaChevronLeft className='iconing' />
                                            </button>
                                            <button onClick={() => handleNext(story.id)}>
                                                <FaChevronRight className='iconing' />
                                            </button>
                                        </div>
                                    </Swiper>
                                ) : (
                                    <div className="empty-story-modal flex justify-center items-center h-[300px]">
                                        <img src={story?.image ?? ""} alt="empty-logo" className="w-[100%] h-[100%] opacity-100" />
                                    </div>
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default StoriesModal;
