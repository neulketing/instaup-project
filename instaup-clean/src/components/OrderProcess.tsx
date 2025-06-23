import { useEffect, useState } from "react";
import type { Platform, ServiceItem } from "../types/services";
import type { UserSession } from "../utils/auth";

interface OrderProcessProps {
  userSession: UserSession | null;
  onAuth: (mode: "signin" | "signup") => void;
  onShowRecharge: () => void;
  onOrder: (orderData: {
    service: ServiceItem;
    targetUrl: string;
    quantity: number;
    totalPrice: number;
  }) => void;
}

export default function OrderProcess({
  userSession,
  onAuth,
  onShowRecharge,
  onOrder,
}: OrderProcessProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );
  const [selectedAccountType, setSelectedAccountType] = useState<
    "korean" | "foreign"
  >("korean");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null,
  );
  const [targetUrl, setTargetUrl] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  // SNS샵과 동일한 전체 서비스 데이터
  const allServices: ServiceItem[] = [
    // ===== 인스타그램 서비스 =====
    // 팔로워 서비스들
    {
      id: "instagram_21",
      platform: "instagram" as Platform,
      category: "followers" as any,
      name: "인스타 실제 한국 팔로워",
      description: `📣 서비스 특징
100% 실제 활동하는 한국인 유저들이 인스타 공식앱을 통해 직접 방문하여 팔로우를 눌러드리는 방식으로 안전하게 진행됩니다.
실제 한국인 서비스는 계정활성화나 계정홍보를 원하시는 분들에게 효과적인 서비스입니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~6시간 내에 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 인스타 프로필 화면에서 '사용자 이름' 복사
2. 링크 입력창에 인스타그램 아이디(@사용자이름) 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 아이디 변경 및 비공개 전환 X`,
      price: 180,
      minOrder: 20,
      maxOrder: 3000000,
      deliveryTime: "1~6시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["실제 한국인", "30일 AS", "안전한 방식", "프리미엄 품질"],
    },
    {
      id: "instagram_577",
      platform: "instagram" as Platform,
      category: "followers" as any,
      name: "인스타 한국인 팔로워",
      description: `📣 서비스 특징
대량 구매에 최적화된 한국인 팔로워 서비스입니다.
실제 활동하는 한국인 유저들의 자연스러운 팔로우로 진행됩니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~6시간 내에 시작됩니다.

⌨ 주문방법
1. 인스타 프로필 화면에서 '사용자 이름' 복사
2. 링크 입력창에 인스타그램 아이디(@사용자이름) 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 아이디 변경 및 비공개 전환 X`,
      price: 150,
      minOrder: 50,
      maxOrder: 1000000,
      deliveryTime: "1~6시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 한국인", "30일 AS", "대량구매", "빠른 시작"],
    },

    // 좋아요 서비스들
    {
      id: "instagram_56",
      platform: "instagram" as Platform,
      category: "likes" as any,
      name: "인스타 좋아요",
      description: `📣 서비스 특징
인스타그램 게시물의 좋아요를 자연스럽게 증가시켜드립니다.
실제 활동하는 계정들이 좋아요를 눌러드리는 방식으로 안전하게 진행됩니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~30분 내에 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 인스타 게시물 링크를 복사하세요
2. 예시) https://www.instagram.com/p/xxxxxxxxxxx/
3. 링크 입력창에 게시물 URL 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 게시물 삭제 X`,
      price: 15,
      minOrder: 10,
      maxOrder: 50000,
      deliveryTime: "1~30분",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["빠른 시작", "30일 AS", "안전한 방식", "자연스러운 증가"],
    },
    {
      id: "instagram_147",
      platform: "instagram" as Platform,
      category: "likes" as any,
      name: "인스타 좋아요 고속",
      description: `📣 서비스 특징
고속으로 진행되는 인스타그램 좋아요 서비스입니다.
빠른 시간 내에 좋아요 수를 증가시킬 수 있습니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~30분 내에 시작됩니다.

⌨ 주문방법
1. 인스타 게시물 링크를 복사하세요
2. 예시) https://www.instagram.com/p/xxxxxxxxxxx/
3. 링크 입력창에 게시물 URL 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 게시물 삭제 X`,
      price: 12,
      minOrder: 10,
      maxOrder: 50000,
      deliveryTime: "1~30분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["고속 진행", "30일 AS", "즉시 시작", "대량 가능"],
    },
    {
      id: "instagram_215",
      platform: "instagram" as Platform,
      category: "likes" as any,
      name: "인스타 좋아요 저렴",
      description: `📣 서비스 특징
경제적인 가격의 인스타그램 좋아요 서비스입니다.
적은 비용으로 좋아요 수를 증가시킬 수 있습니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~30분 내에 시작됩니다.

⌨ 주문방법
1. 인스타 게시물 링크를 복사하세요
2. 예시) https://www.instagram.com/p/xxxxxxxxxxx/
3. 링크 입력창에 게시물 URL 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 게시물 삭제 X`,
      price: 8,
      minOrder: 20,
      maxOrder: 9500,
      deliveryTime: "1~30분",
      quality: "standard",
      unit: "개",
      isPopular: false,
      features: ["경제적 가격", "30일 AS", "빠른 시작", "소량 주문"],
    },
    {
      id: "instagram_251",
      platform: "instagram" as Platform,
      category: "likes" as any,
      name: "인스타 좋아요 스탠다드",
      description: `📣 서비스 특징
균형잡힌 가격과 품질의 인스타그램 좋아요 서비스입니다.
안정적인 좋아요 증가를 원하시는 분들께 추천합니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~30분 내에 시작됩니다.

⌨ 주문방법
1. 인스타 게시물 링크를 복사하세요
2. 예시) https://www.instagram.com/p/xxxxxxxxxxx/
3. 링크 입력창에 게시물 URL 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 게시물 삭제 X`,
      price: 10,
      minOrder: 20,
      maxOrder: 20000,
      deliveryTime: "1~30분",
      quality: "standard",
      unit: "개",
      isPopular: false,
      features: ["균형잡힌 품질", "30일 AS", "안정적", "중간 가격"],
    },
    {
      id: "instagram_502",
      platform: "instagram" as Platform,
      category: "likes" as any,
      name: "인스타 좋아요 대량",
      description: `📣 서비스 특징
대량 주문에 최적화된 인스타그램 좋아요 서비스입니다.
많은 수량의 좋아요가 필요한 경우에 적합합니다.

🔄 30일 AS 보장
주문내역에서 '리필'버튼을 눌러 직접 AS 가능합니다.

🌟 작업속도
주문 후 1~30분 내에 시작됩니다.

⌨ 주문방법
1. 인스타 게시물 링크를 복사하세요
2. 예시) https://www.instagram.com/p/xxxxxxxxxxx/
3. 링크 입력창에 게시물 URL 입력 후 주문

❗ 확인해 주세요
- 주문 전 공개 상태인지 확인해 주세요.(비공개로 주문 X)
- 작업 진행 중 게시물 삭제 X`,
      price: 9,
      minOrder: 20,
      maxOrder: 20000,
      deliveryTime: "1~30분",
      quality: "standard",
      unit: "개",
      isPopular: false,
      features: ["대량 주문", "30일 AS", "빠른 처리", "벌크 가격"],
    },

    // 댓글 서비스들
    {
      id: "instagram_92",
      platform: "instagram" as Platform,
      category: "comments" as any,
      name: "인스타 랜덤 댓글",
      description: `📣 서비스 특징
고퀄리티 계정들이 게시물을 보고 무작위(랜덤) 댓글을 달아드리는 서비스입니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~120분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 주문할 게시물의 '공유' 아이콘 [클릭]
2. 화면 하단 '링크복사' 아이콘 [클릭]
3. 링크 입력창에 게시물 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 80,
      minOrder: 10,
      maxOrder: 100,
      deliveryTime: "1~120분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "랜덤 댓글", "안전한 방식", "즉시 시작"],
    },
    {
      id: "instagram_463",
      platform: "instagram" as Platform,
      category: "comments" as any,
      name: "인스타 이모지 댓글",
      description: `📣 서비스 특징
고퀄리티 계정들이 게시물을 보고 이모지(이모티콘) 댓글을 달아드리는 서비스입니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~120분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 주문할 게시물의 '공유' 아이콘 [클릭]
2. 화면 하단 '링크복사' 아이콘 [클릭]
3. 링크 입력창에 게시물 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 80,
      minOrder: 10,
      maxOrder: 1000,
      deliveryTime: "1~120분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "이모지 댓글", "안전한 방식", "빠른 시작"],
    },
    {
      id: "instagram_462",
      platform: "instagram" as Platform,
      category: "comments" as any,
      name: "인스타 커스텀 댓글",
      description: `📣 서비스 특징
고퀄리티 계정들이 '댓글 설정'에 적어주신대로 댓글을 달아드리는 서비스입니다.
댓글을 1줄에 1개씩 적어주세요. (엔터로 구분)
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~120분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 주문할 게시물의 '공유' 아이콘 [클릭]
2. 화면 하단 '링크복사' 아이콘 [클릭]
3. 링크 입력창에 게시물 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.
- 댓글 내용에 해시태그, @ 입력시 작업이 불가능합니다.`,
      price: 80,
      minOrder: 5,
      maxOrder: 100000,
      deliveryTime: "1~120분",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["실제 유저", "커스텀 댓글", "맞춤 설정", "대량 주문"],
    },
    {
      id: "instagram_617",
      platform: "instagram" as Platform,
      category: "comment_likes" as any,
      name: "인스타 댓글 좋아요",
      description: `❗ 게시물 주소가 아닌 댓글 주소를 입력해주세요(주문방법 참고)

📣 서비스 특징
실제 유저들이 주문링크에 입력한 '댓글'에 좋아요를 눌러드리는 서비스 입니다.
게시물의 좋아요는 증가하지 않고 댓글의 좋아요만 증가합니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

❗PC에서만 링크 복사 가능합니다. 주문방법을 꼭 확인해주세요.

🌟 작업속도
주문 후 1~120분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 'PC'버전 인스타그램에 접속
2. 주문하실 댓글에 있는 '시간 또는 날짜'(아이디 아래 표시됨)를 [클릭]
3. 브라우저 상단 주소창에 있는❗댓글주소(URL)를 [복사]❗
4. 링크 입력창에 댓글 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/c/12345678910111213

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 50,
      minOrder: 20,
      maxOrder: 15000,
      deliveryTime: "1~120분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "댓글 좋아요", "PC 전용", "안전한 방식"],
    },

    // 릴스 조회수 서비스들
    {
      id: "instagram_12",
      platform: "instagram" as Platform,
      category: "reels_views" as any,
      name: "인스타 릴스 조회수",
      description: `📣 서비스 특징
고퀄리티 계정으로 릴스/영상 조회수를 늘려드리는 서비스입니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~60분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 주문할 게시물의 '공유' 아이콘 [클릭]
2. 화면 하단 '링크복사' 아이콘 [클릭]
3. 링크 입력창에 게시물 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 0.3,
      minOrder: 100,
      maxOrder: 500000,
      deliveryTime: "1~60분",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["고퀄리티", "빠른 시작", "안전한 방식", "대량 가능"],
    },
    {
      id: "instagram_48",
      platform: "instagram" as Platform,
      category: "reels_views" as any,
      name: "인스타 릴스 조회수 프리미엄",
      description: `📣 서비스 특징
최고퀄리티 외국인 계정으로 릴스/영상 조회수를 늘려드리는 서비스입니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~60분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 주문할 게시물의 '공유' 아이콘 [클릭]
2. 화면 하단 '링크복사' 아이콘 [클릭]
3. 링크 입력창에 게시물 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 0.4,
      minOrder: 100,
      maxOrder: 500000,
      deliveryTime: "1~60분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["최고퀄리티", "외국인 계정", "빠른 시작", "대량 가능"],
    },
    {
      id: "instagram_15",
      platform: "instagram" as Platform,
      category: "reels_views" as any,
      name: "인스타 릴스 조회수 대량",
      description: `📣 서비스 특징
실제 활동 계정으로 릴스 조회수를 늘려드리는 서비스입니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~60분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 주문할 게시물의 '공유' 아이콘 [클릭]
2. 화면 하단 '링크복사' 아이콘 [클릭]
3. 링크 입력창에 게시물 주소(링크) 입력하여 주문
예) https://www.instagram.com/p/xxxxxxxxxxx/

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 게시물에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 0.6,
      minOrder: 100,
      maxOrder: 10000000,
      deliveryTime: "1~60분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "최대 1천만개", "안전한 방식", "즉시 시작"],
    },
    {
      id: "instagram_37",
      platform: "instagram" as Platform,
      category: "story_views" as any,
      name: "인스타 스토리 조회수",
      description: `📣 서비스 특징
고퀄리티 계정으로 스토리 조회수를 늘려드리는 서비스입니다.
가장 최근(마지막 업로드)스토리에 조회수가 유입됩니다.
인스타 공식앱을 통해진행되기 때문에 안전하게 이용하실 수 있습니다.

🌟 작업속도
주문 후 1~180분 내에 자동으로 시작됩니다.
'주문내역'메뉴에서 진행 현황을 직접 확인할 수 있습니다.

⌨ 주문방법
1. 인스타 프로필 화면에서 프로필편집 [클릭]
2. '사용자이름' 복사
3. 링크 입력창에 인스타그램 아이디(사용자이름) 입력 후 주문

❗ 확인해 주세요
- 주문실수의 경우 취소 및 수정이 어렵습니다.
- 주문 전 공개 상태인지 확인해주세요.(비공개로 주문 X)
- 동일한 스토리에 추가 주문 시에는 꼭 이전 주문이 완료된 후 주문해 주세요.`,
      price: 1.5,
      minOrder: 50,
      maxOrder: 100000,
      deliveryTime: "1~180분",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["스토리 전용", "최근 스토리", "고퀄리티", "안전한 방식"],
    },

    // ===== 유튜브 서비스 =====
    {
      id: "youtube_01",
      platform: "youtube" as Platform,
      category: "subscribers" as any,
      name: "유튜브 구독자",
      description: "유튜브 채널의 구독자를 늘려드립니다.",
      price: 25,
      minOrder: 10,
      maxOrder: 100000,
      deliveryTime: "1~24시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["실제 유저", "안전한 방식", "빠른 시작", "고품질"],
    },
    {
      id: "youtube_02",
      platform: "youtube" as Platform,
      category: "views" as any,
      name: "유튜브 조회수",
      description: "유튜브 영상의 조회수를 늘려드립니다.",
      price: 2,
      minOrder: 100,
      maxOrder: 1000000,
      deliveryTime: "1~12시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["고속 처리", "안전한 방식", "대량 가능", "자연스러운 증가"],
    },
    {
      id: "youtube_03",
      platform: "youtube" as Platform,
      category: "likes" as any,
      name: "유튜브 좋아요",
      description: "유튜브 영상의 좋아요를 늘려드립니다.",
      price: 20,
      minOrder: 10,
      maxOrder: 50000,
      deliveryTime: "1~6시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["고품질", "빠른 처리", "안전한 방식", "실제 유저"],
    },
    {
      id: "youtube_04",
      platform: "youtube" as Platform,
      category: "comments" as any,
      name: "유튜브 댓글",
      description: "유튜브 영상에 댓글을 달아드립니다.",
      price: 150,
      minOrder: 5,
      maxOrder: 500,
      deliveryTime: "1~48시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "커스텀 댓글", "고품질", "안전한 방식"],
    },

    // ===== 틱톡 서비스 =====
    {
      id: "tiktok_01",
      platform: "tiktok" as Platform,
      category: "followers" as any,
      name: "틱톡 팔로워",
      description: "틱톡 계정의 팔로워를 늘려드립니다.",
      price: 30,
      minOrder: 20,
      maxOrder: 50000,
      deliveryTime: "1~24시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["실제 유저", "안전한 방식", "고품질", "빠른 시작"],
    },
    {
      id: "tiktok_02",
      platform: "tiktok" as Platform,
      category: "likes" as any,
      name: "틱톡 좋아요",
      description: "틱톡 영상의 좋아요를 늘려드립니다.",
      price: 12,
      minOrder: 20,
      maxOrder: 100000,
      deliveryTime: "1~6시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["고속 처리", "안전한 방식", "대량 가능", "자연스러운 증가"],
    },
    {
      id: "tiktok_03",
      platform: "tiktok" as Platform,
      category: "views" as any,
      name: "틱톡 조회수",
      description: "틱톡 영상의 조회수를 늘려드립니다.",
      price: 1,
      minOrder: 100,
      maxOrder: 5000000,
      deliveryTime: "1~12시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["고속 처리", "대량 가능", "안전한 방식", "즉시 시작"],
    },

    // ===== 페이스북 서비스 =====
    {
      id: "facebook_01",
      platform: "facebook" as Platform,
      category: "followers" as any,
      name: "페이스북 팔로워",
      description: "페이스북 계정의 팔로워를 늘려드립니다.",
      price: 25,
      minOrder: 20,
      maxOrder: 50000,
      deliveryTime: "1~24시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "안전한 방식", "고품질", "빠른 시작"],
    },
    {
      id: "facebook_02",
      platform: "facebook" as Platform,
      category: "likes" as any,
      name: "페이스북 좋아요",
      description: "페이스북 게시물의 좋아요를 늘려드립니다.",
      price: 18,
      minOrder: 20,
      maxOrder: 50000,
      deliveryTime: "1~12시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["고속 처리", "안전한 방식", "실제 유저", "자연스러운 증가"],
    },
    {
      id: "facebook_03",
      platform: "facebook" as Platform,
      category: "page_likes" as any,
      name: "페이스북 페이지 좋아요",
      description: "페이스북 페이지의 좋아요를 늘려드립니다.",
      price: 22,
      minOrder: 20,
      maxOrder: 50000,
      deliveryTime: "1~24시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "안전한 방식", "고품질", "페이지 전용"],
    },

    // ===== 트위터/X 서비스 =====
    {
      id: "twitter_01",
      platform: "twitter" as Platform,
      category: "followers" as any,
      name: "X 팔로워",
      description: "X(트위터) 계정의 팔로워를 늘려드립니다.",
      price: 35,
      minOrder: 20,
      maxOrder: 50000,
      deliveryTime: "1~24시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "안전한 방식", "고품질", "빠른 시작"],
    },
    {
      id: "twitter_02",
      platform: "twitter" as Platform,
      category: "likes" as any,
      name: "X 좋아요",
      description: "X(트위터) 게시물의 좋아요를 늘려드립니다.",
      price: 25,
      minOrder: 10,
      maxOrder: 50000,
      deliveryTime: "1~6시간",
      quality: "premium",
      unit: "개",
      isPopular: true,
      features: ["고속 처리", "안전한 방식", "실제 유저", "자연스러운 증가"],
    },
    {
      id: "twitter_03",
      platform: "twitter" as Platform,
      category: "retweets" as any,
      name: "X 리트윗",
      description: "X(트위터) 게시물의 리트윗을 늘려드립니다.",
      price: 40,
      minOrder: 5,
      maxOrder: 10000,
      deliveryTime: "1~12시간",
      quality: "premium",
      unit: "개",
      isPopular: false,
      features: ["실제 유저", "안전한 방식", "고품질", "확산 효과"],
    },
  ];

  // 할인율 계산 (수량에 따라 최대 15% 할인)
  const calculateDiscount = (quantity: number): number => {
    if (quantity >= 10000) return 15;
    if (quantity >= 5000) return 12;
    if (quantity >= 2000) return 10;
    if (quantity >= 1000) return 8;
    if (quantity >= 500) return 5;
    if (quantity >= 200) return 3;
    return 0;
  };

  // 총 가격 계산
  const calculateTotalPrice = (): number => {
    if (!selectedService) return 0;
    const basePrice = (selectedService.price * quantity) / 100;
    const discountRate = calculateDiscount(quantity);
    return Math.round(basePrice * (1 - discountRate / 100));
  };

  // 플랫폼별 서비스 필터링
  const getServicesByPlatform = (platform: Platform | null) => {
    if (!platform) return [];
    return allServices.filter((s) => s.platform === platform);
  };

  // 카테고리별 서비스 분류
  const getServicesByCategory = () => {
    const platformServices = getServicesByPlatform(selectedPlatform);

    const categories = {
      followers: platformServices.filter((s) => s.category === "followers"),
      likes: platformServices.filter((s) => s.category === "likes"),
      comments: platformServices.filter((s) => s.category === "comments"),
      views: platformServices.filter((s) => s.category === "views"),
      subscribers: platformServices.filter((s) => s.category === "subscribers"),
      reels_views: platformServices.filter((s) => s.category === "reels_views"),
      story_views: platformServices.filter((s) => s.category === "story_views"),
      comment_likes: platformServices.filter(
        (s) => s.category === "comment_likes",
      ),
      page_likes: platformServices.filter((s) => s.category === "page_likes"),
      retweets: platformServices.filter((s) => s.category === "retweets"),
    };

    return categories;
  };

  // 서비스 선택 처리
  const handleServiceSelect = (service: ServiceItem) => {
    setSelectedService(service);
    setQuantity(service.minOrder);
    setCurrentStep(3); // step 2에서 서비스 선택 시 step 3으로 이동
  };

  // 다음 단계로 이동 (현재 사용하지 않음)
  const handleNext = () => {
    // 현재 단계별 직접 이동으로 대체됨
  };

  // 이전 단계로 이동
  const handlePrev = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);

      // 이전 단계로 갈 때 해당 단계의 선택 상태 초기화
      if (newStep === 1) {
        // 1단계로 돌아가면 모든 선택 초기화
        setSelectedPlatform(null);
        setSelectedAccountType("korean");
        setSelectedService(null);
        setTargetUrl("");
        setQuantity(100);
      } else if (newStep === 2) {
        // 2단계로 돌아가면 서비스 선택 이후 초기화
        setSelectedService(null);
        setTargetUrl("");
        setQuantity(100);
      } else if (newStep === 3) {
        // 3단계로 돌아가면 주문 정보만 초기화
        setTargetUrl("");
        setQuantity(100);
      }
    }
  };

  // 주문 제출
  const handleSubmit = async () => {
    if (!selectedService || !userSession) {
      onAuth("signin");
      return;
    }

    if (!targetUrl || quantity < (selectedService.minOrder || 0)) {
      return;
    }

    setIsLoading(true);
    try {
      await onOrder({
        service: selectedService,
        targetUrl,
        quantity,
        totalPrice: calculateTotalPrice(),
      });
      // 주문 성공 후 초기화 (1단계로 돌아가기)
      setCurrentStep(1);
      setSelectedService(null);
      setTargetUrl("");
      setQuantity(100);
    } catch (error) {
      console.error("주문 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트시 초기화 (한번만 실행)
  useEffect(() => {
    // 컴포넌트가 처음 마운트될 때만 실행
    console.log("OrderProcess 컴포넌트 마운트됨");
  }, []);

  // 플랫폼 선택시 자동으로 다음 단계로 이동
  useEffect(() => {
    if (selectedPlatform && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [selectedPlatform, currentStep]);

  const categories = getServicesByCategory();

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-[#22426f] text-white p-6 shadow-lg z-10">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <img
              src="https://ext.same-assets.com/3036106235/246958056.svg"
              alt="InstaUp"
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">주문하기</h1>
              <p className="text-sm opacity-90">
                실제 한국인 SNS 마케팅 서비스
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 진행 단계 표시 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            {[
              { num: "01", title: "이용하실 서비스 유형을 선택해 주세요." },
              { num: "02", title: "세부 서비스를 선택해주세요." },
              { num: "03", title: "구매하실 상품을 선택해 주세요." },
            ].map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep > index + 1
                        ? "bg-green-500 text-white shadow-lg"
                        : currentStep === index + 1
                          ? "bg-[#22426f] text-white shadow-lg ring-4 ring-blue-200"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > index + 1 ? "✓" : step.num}
                  </div>
                  <div
                    className={`text-xs mt-2 font-medium text-center max-w-[200px] ${
                      currentStep >= index + 1
                        ? "text-[#22426f]"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < 2 && (
                  <div
                    className={`w-20 h-1 mx-3 rounded ${
                      currentStep > index + 1 ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {/* Step 1: 플랫폼 선택 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#22426f] to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    01
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    이용하실 서비스 유형을 선택해 주세요.
                  </h2>
                </div>
              </div>

              {/* 플랫폼 그리드 */}
              <div className="grid grid-cols-6 gap-4">
                {[
                  {
                    icon: "⭐",
                    name: "추천서비스",
                    platform: null,
                    active: false,
                  },
                  { icon: "🎁", name: "이벤트", platform: null, active: false },
                  {
                    icon: "👑",
                    name: "상위노출",
                    platform: null,
                    active: false,
                  },
                  {
                    icon: "📊",
                    name: "계정관리",
                    platform: null,
                    active: false,
                  },
                  { icon: "📦", name: "패키지", platform: null, active: false },
                  {
                    icon: "📷",
                    name: "인스타그램",
                    platform: "instagram" as Platform,
                    active: true,
                  },
                  {
                    icon: "🎥",
                    name: "유튜브",
                    platform: "youtube" as Platform,
                    active: true,
                  },
                  {
                    icon: "📘",
                    name: "페이스북",
                    platform: "facebook" as Platform,
                    active: true,
                  },
                  {
                    icon: "🎵",
                    name: "틱톡",
                    platform: "tiktok" as Platform,
                    active: true,
                  },
                  { icon: "🔗", name: "스레드", platform: null, active: false },
                  {
                    icon: "🐦",
                    name: "트위터",
                    platform: "twitter" as Platform,
                    active: true,
                  },
                  { icon: "📌", name: "Nz로블", platform: null, active: false },
                  {
                    icon: "📈",
                    name: "뉴스언론보도",
                    platform: null,
                    active: false,
                  },
                  { icon: "🎬", name: "채널단", platform: null, active: false },
                  { icon: "📺", name: "카카오", platform: null, active: false },
                  {
                    icon: "🎭",
                    name: "스토어마케팅",
                    platform: null,
                    active: false,
                  },
                  {
                    icon: "🎯",
                    name: "어플마케팅",
                    platform: null,
                    active: false,
                  },
                  {
                    icon: "⚙️",
                    name: "SEO트래픽",
                    platform: null,
                    active: false,
                  },
                  { icon: "🔧", name: "기타", platform: null, active: false },
                ].map((platformData, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (platformData.active && platformData.platform) {
                        console.log(
                          "플랫폼 선택 버튼 클릭:",
                          platformData.platform,
                        );
                        setSelectedPlatform(platformData.platform);
                        // useEffect에서 자동으로 다음 스텝으로 이동됨
                      }
                    }}
                    disabled={!platformData.active}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      platformData.active
                        ? selectedPlatform === platformData.platform
                          ? "border-blue-500 bg-blue-100 ring-2 ring-blue-200"
                          : "border-blue-500 bg-blue-50 hover:bg-blue-100"
                        : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-2xl mb-2">{platformData.icon}</div>
                    <div className="text-sm font-medium">
                      {platformData.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 서비스 카테고리 및 세부 서비스 선택 */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#22426f] to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    02
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    세부 서비스를 선택해주세요.
                  </h2>
                </div>
              </div>

              {/* 한국인/외국인 탭 */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden max-w-lg mx-auto">
                <button
                  onClick={() => setSelectedAccountType("korean")}
                  className={`flex-1 py-3 px-6 font-medium transition-colors ${
                    selectedAccountType === "korean"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">🇰🇷</span>
                  한국인
                </button>
                <button
                  onClick={() => setSelectedAccountType("foreign")}
                  className={`flex-1 py-3 px-6 font-medium transition-colors ${
                    selectedAccountType === "foreign"
                      ? "bg-[#22426f] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">🌍</span>
                  외국인
                </button>
              </div>

              {/* 간소화된 서비스 카테고리 그리드 */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* 팔로워/구독자 */}
                  {(categories.followers.length > 0 ||
                    categories.subscribers.length > 0) && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-2xl text-white">👥</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {selectedPlatform === "youtube"
                            ? "구독자 늘리기"
                            : "팔로워 늘리기"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedPlatform === "youtube"
                            ? "실제 구독자로 채널 성장"
                            : "실제 팔로워로 계정 성장"}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[...categories.followers, ...categories.subscribers]
                            .slice(0, 2)
                            .map((service) => (
                              <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-colors"
                              >
                                {service.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 좋아요 */}
                  {categories.likes.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-red-300 transition-all cursor-pointer group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-2xl text-white">❤️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          좋아요 늘리기
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          게시물 인기도 향상
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {categories.likes.slice(0, 2).map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleServiceSelect(service)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-full hover:bg-red-100 transition-colors"
                            >
                              {service.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 조회수 */}
                  {(categories.views.length > 0 ||
                    categories.reels_views.length > 0) && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-2xl text-white">👁️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {selectedPlatform === "instagram"
                            ? "릴스 조회수 늘리기"
                            : "조회수 늘리기"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {selectedPlatform === "instagram"
                            ? "릴스 영상 노출 확대"
                            : "영상 조회수 증가"}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {[...categories.views, ...categories.reels_views]
                            .slice(0, 2)
                            .map((service) => (
                              <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                className="px-3 py-1.5 bg-green-50 text-green-600 text-xs rounded-full hover:bg-green-100 transition-colors"
                              >
                                {service.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 댓글 */}
                  {categories.comments.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-2xl text-white">💬</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          댓글 늘리기
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          게시물 참여도 향상
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {categories.comments.slice(0, 2).map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleServiceSelect(service)}
                              className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs rounded-full hover:bg-purple-100 transition-colors"
                            >
                              {service.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 페이스북 페이지 좋아요 */}
                  {categories.page_likes.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-2xl text-white">📘</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          페이지 좋아요
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          페이스북 페이지 성장
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {categories.page_likes.slice(0, 2).map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleServiceSelect(service)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-colors"
                            >
                              {service.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 트위터 리트윗 */}
                  {categories.retweets.length > 0 && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all cursor-pointer group">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <span className="text-2xl text-white">🔄</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          리트윗
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          트윗 확산 효과
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {categories.retweets.slice(0, 2).map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleServiceSelect(service)}
                              className="px-3 py-1.5 bg-cyan-50 text-cyan-600 text-xs rounded-full hover:bg-cyan-100 transition-colors"
                            >
                              {service.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 뒤로가기 버튼 */}
              <div className="flex justify-start">
                <button
                  onClick={handlePrev}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← 이전 단계
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 주문 정보 입력 */}
          {currentStep === 3 && selectedService && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#22426f] to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    03
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    구매하실 상품을 선택해 주세요.
                  </h2>
                </div>
              </div>

              {/* 선택된 서비스 정보 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  📋 선택된 서비스
                </h3>
                <p className="text-blue-700 font-medium">
                  {selectedService.name}
                </p>
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="bg-white px-3 py-1 rounded-full">
                    가격: {selectedService.price.toLocaleString()}원/100개
                  </span>
                  <span className="bg-white px-3 py-1 rounded-full">
                    처리시간: {selectedService.deliveryTime}
                  </span>
                </div>
              </div>

              {/* 드롭다운에서 서비스 선택 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  서비스 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedService.id}
                  onChange={(e) => {
                    const service = allServices.find(
                      (s) => s.id === e.target.value,
                    );
                    if (service) {
                      setSelectedService(service);
                      setQuantity(service.minOrder);
                    }
                  }}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22426f] focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  {getServicesByPlatform(selectedPlatform).map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - ₩{service.price.toLocaleString()} [1개당]
                    </option>
                  ))}
                </select>
              </div>

              {/* URL 입력 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  {selectedService.category === "followers" ||
                  selectedService.category === "subscribers"
                    ? `📎 ${selectedPlatform === "youtube" ? "채널 URL" : "계정 URL"}`
                    : `📎 ${
                        selectedPlatform === "youtube"
                          ? "영상 URL"
                          : selectedPlatform === "twitter"
                            ? "트윗 URL"
                            : selectedPlatform === "facebook"
                              ? "게시물 URL"
                              : selectedPlatform === "tiktok"
                                ? "영상 URL"
                                : "게시물 URL"
                      }`}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder={
                    selectedService.category === "followers" ||
                    selectedService.category === "subscribers"
                      ? selectedPlatform === "youtube"
                        ? "https://youtube.com/@채널이름"
                        : selectedPlatform === "twitter"
                          ? "https://twitter.com/사용자이름"
                          : selectedPlatform === "tiktok"
                            ? "https://tiktok.com/@사용자이름"
                            : "@사용자이름 또는 프로필 URL"
                      : selectedPlatform === "youtube"
                        ? "https://youtube.com/watch?v=XXXXXXXXX"
                        : selectedPlatform === "twitter"
                          ? "https://twitter.com/username/status/XXXXXXXXX"
                          : selectedPlatform === "tiktok"
                            ? "https://tiktok.com/@username/video/XXXXXXXXX"
                            : "게시물 URL을 입력하세요"
                  }
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22426f] focus:ring-4 focus:ring-blue-100 transition-all"
                  required
                />
              </div>

              {/* 수량 입력 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  📊 주문 수량 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.max(selectedService.minOrder, quantity - 100),
                      )
                    }
                    className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          selectedService.minOrder,
                          Number.parseInt(e.target.value) || 0,
                        ),
                      )
                    }
                    min={selectedService.minOrder}
                    max={selectedService.maxOrder}
                    className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22426f] focus:ring-4 focus:ring-blue-100 transition-all text-center text-lg font-bold"
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(selectedService.maxOrder, quantity + 100),
                      )
                    }
                    className="w-12 h-12 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>
                    최소: {selectedService.minOrder.toLocaleString()}개
                  </span>
                  <span>
                    최대: {selectedService.maxOrder.toLocaleString()}개
                  </span>
                </div>
              </div>

              {/* 할인 및 총 가격 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">
                  💰 주문 금액
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>기본 가격:</span>
                    <span>
                      ₩
                      {(
                        (selectedService.price * quantity) /
                        100
                      ).toLocaleString()}
                    </span>
                  </div>
                  {calculateDiscount(quantity) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>할인 ({calculateDiscount(quantity)}%):</span>
                      <span>
                        -₩
                        {(
                          ((selectedService.price * quantity) / 100) *
                          (calculateDiscount(quantity) / 100)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold text-green-900">
                    <span>총 결제 금액:</span>
                    <span>₩{calculateTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 주문 실행 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← 이전 단계
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !targetUrl ||
                    quantity < selectedService.minOrder ||
                    isLoading
                  }
                  className="flex-1 bg-gradient-to-r from-[#22426f] to-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:from-[#1e3b61] hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? "주문 처리중..."
                    : `₩${calculateTotalPrice().toLocaleString()} 주문하기`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
