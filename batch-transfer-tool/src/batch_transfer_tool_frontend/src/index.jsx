import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";
import { Audio } from 'react-loader-spinner'
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";

import { icrc1IDL } from "../idls/icrc1.did";
import { ext721IDL } from "../idls/ext721.did";
import { getAccountId, getTokenIdentifier } from '../components/utils';

const App = () => {
  const btc_token = 'mxzaz-hqaaa-aaaar-qaada-cai';

  const [connect, setConnect] = useState("Please Connect you Wallet!");
  const [loader, setLoader] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [acc_add, setAccAdd] = useState("");

  const [canister, setCanister] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(0);
  const [btc_balance, setBTCBalance] = useState(0);

  const [json, setJson] = useState("");

  const [collectionCanister, setCollectionCanister] = useState("");
  const [princiapals, setPrincipals] = useState([]);
  const [from, setFrom] = useState("");

  const whitelist = ["rw7qm-eiaaa-aaaak-aaiqq-cai",
    "gikg4-eaaaa-aaaam-qaieq-cai",
    "jgict-maaaa-aaaam-qa5xq-cai",
    "bsdmf-gyaaa-aaaak-acgka-cai",
    "e3izy-jiaaa-aaaah-qacbq-cai",
    "bid2t-gyaaa-aaaah-qcdea-cai",
    "nc2nv-jiaaa-aaaam-qa5ma-cai",
    "bzsui-sqaaa-aaaah-qce2a-cai",
    "rxrsz-5aaaa-aaaam-qaysa-cai",
    "gevsk-tqaaa-aaaah-qaoca-cai",
    "uzhxd-ziaaa-aaaah-qanaq-cai",
    "oeee4-qaaaa-aaaak-qaaeq-cai",
    "pnpu4-3aaaa-aaaah-qcceq-cai",
    "tx72y-iaaaa-aaaam-qatoq-cai",
    "owuqd-dyaaa-aaaah-qapxq-cai",
    "lcgbg-kaaaa-aaaam-qaota-cai",
    "sbcwr-3qaaa-aaaam-qamoa-cai",
    "dhyds-jaaaa-aaaao-aaiia-cai",
    "legpi-qqaaa-aaaam-qa2ha-cai",
    "cxlb5-5qaaa-aaaam-qaxya-cai",
    "rw7qm-eiaaa-aaaak-aaiqq-cai",
    "dcbuw-wyaaa-aaaam-qapfq-cai",
    "6fosk-kaaaa-aaaak-aawqq-cai",
    "cchps-gaaaa-aaaak-qasaa-cai",
    "3db6u-aiaaa-aaaah-qbjbq-cai",
    "bvckr-laaaa-aaaak-acgkq-cai",
    "gtb2b-tiaaa-aaaah-qcxca-cai",
    "b5el6-hqaaa-aaaah-qcdhq-cai",
    "hybqz-laaaa-aaaam-qa4vq-cai",
    "j3c2x-ciaaa-aaaak-aanxa-cai",
    "6km5p-fiaaa-aaaah-qczxa-cai",
    "2vd2w-riaaa-aaaam-qazpq-cai",
    "cnxby-3qaaa-aaaah-qcdpq-cai",
    "tde7l-3qaaa-aaaah-qansa-cai",
    "vigb2-cqaaa-aaaam-qayla-cai",
    "3cjkh-tqaaa-aaaam-qan6a-cai",
    "5t44v-paaaa-aaaah-qcz6q-cai",
    "24ark-haaaa-aaaam-qazoa-cai",
    "ckwhm-wiaaa-aaaah-qcdpa-cai",
    "v3b6z-ziaaa-aaaam-qam4q-cai",
    "fc5yf-vqaaa-aaaam-qa42q-cai",
    "skjpp-haaaa-aaaae-qac7q-cai",
    "6wih6-siaaa-aaaah-qczva-cai",
    "eagn3-qaaaa-aaaam-qaxna-cai",
    "arttq-uaaaa-aaaam-qaxva-cai",
    "q6hjz-kyaaa-aaaah-qcama-cai",
    "k4p2l-6qaaa-aaaam-qa2da-cai",
    "gyuaf-kqaaa-aaaah-qceka-cai",
    "5stux-vyaaa-aaaam-qasoa-cai",
    "mk3kn-pyaaa-aaaah-qcoda-cai",
    "73xld-saaaa-aaaah-qbjya-cai",
    "k4qsa-4aaaa-aaaah-qbvnq-cai",
    "2iiif-4qaaa-aaaah-qcs5a-cai",
    "kss7i-hqaaa-aaaah-qbvmq-cai",
    "hjq6c-7iaaa-aaaam-qa3lq-cai",
    "btggw-4aaaa-aaaah-qcdgq-cai",
    "bxdf4-baaaa-aaaah-qaruq-cai",
    "qjyju-jqaaa-aaaam-qamca-cai",
    "dtlqp-nqaaa-aaaak-abwna-cai",
    "dfcq7-raaaa-aaaag-qayqa-cai",
    "t2mog-myaaa-aaaal-aas7q-cai",
    "rmuo4-hyaaa-aaaam-qayqq-cai",
    "4mm3y-hiaaa-aaaam-qaz3q-cai",
    "3vdxu-laaaa-aaaah-abqxa-cai",
    "wlea5-diaaa-aaaam-qatra-cai",
    "t64re-6iaaa-aaaam-qatpa-cai",
    "3ilm3-3aaaa-aaaam-qavha-cai",
    "gksxm-waaaa-aaaao-aapjq-cai",
    "sr4qi-vaaaa-aaaah-qcaaq-cai",
    "xgket-maaaa-aaaam-qatwq-cai",
    "dknxi-2iaaa-aaaah-qceuq-cai",
    "cdvmq-aaaaa-aaaah-qcdoq-cai",
    "crt3j-mqaaa-aaaah-qcdnq-cai",
    "e4ca6-oiaaa-aaaai-acm2a-cai",
    "5pyge-yaaaa-aaaah-qcz4q-cai",
    "rqiax-3iaaa-aaaah-qcyta-cai",
    "nbg4r-saaaa-aaaah-qap7a-cai",
    "xkbqi-2qaaa-aaaah-qbpqq-cai",
    "d3ttm-qaaaa-aaaai-qam4a-cai",
    "qcg3w-tyaaa-aaaah-qakea-cai",
    "ryjl3-tyaaa-aaaaa-aaaba-cai",
    "2tvxo-eqaaa-aaaai-acjla-cai",
    "dur4z-piaaa-aaaam-qai3a-cai",
    "s4rro-jqaaa-aaaal-qbfyq-cai",
    "bfyob-iaaaa-aaaam-qa34a-cai",
    "4kubm-wiaaa-aaaah-qcnoa-cai",
    "x4oqm-bqaaa-aaaam-qahaq-cai",
    "syfnt-cyaaa-aaaag-qaxvq-cai",
    "hzc26-wiaaa-aaaag-qa7ua-cai",
    "ugdkf-taaaa-aaaak-acoia-cai",
    "u52at-pyaaa-aaaam-qa7ta-cai",
    "dxehg-5qaaa-aaaag-qayta-cai",
    "6imyv-myaaa-aaaah-qcv3a-cai",
    "s2fij-liaaa-aaaag-qa3zq-cai",
    "gfjqg-miaaa-aaaag-qbcna-cai",
    "t576z-kqaaa-aaaag-qa4cq-cai",
    "cm2lh-liaaa-aaaag-qa7ka-cai",
    "ctt6t-faaaa-aaaah-qcpbq-cai",
    "pcatl-qiaaa-aaaag-qa6aa-cai",
    "zghjs-vqaaa-aaaam-qa62q-cai",
    "tzjbp-7qaaa-aaaag-qa37a-cai",
    "p5jg7-6aaaa-aaaah-qcolq-cai",
    "vvvht-eyaaa-aaaam-qatya-cai",
    "eejma-naaaa-aaaak-aalda-cai",
    "shcy7-baaaa-aaaam-qay2a-cai",
    "eosur-nqaaa-aaaam-qaijq-cai",
    "yflau-biaaa-aaaam-qa64a-cai",
    "c77wz-2qaaa-aaaam-qa4iq-cai",
    "a6gca-6yaaa-aaaam-qa4fa-cai",
    "4fxe6-2qaaa-aaaah-qcz3q-cai",
    "attwk-5qaaa-aaaam-qa3za-cai",
    "tskpj-aiaaa-aaaag-qaxsq-cai",
    "srggp-uqaaa-aaaag-qaxua-cai",
    "y5prr-fiaaa-aaaam-qagga-cai",
    "ahl3d-xqaaa-aaaaj-qacca-cai",
    "jjeno-oyaaa-aaaak-aanua-cai",
    "6wqte-zyaaa-aaaam-qazuq-cai",
    "albtn-7qaaa-aaaam-qa4gq-cai",
    "uvxj2-ayaaa-aaaak-aapqa-cai",
    "yigae-jqaaa-aaaah-qczbq-cai",
    "7gvfz-3iaaa-aaaah-qcsbq-cai",
    "rw623-hyaaa-aaaah-qctcq-cai",
    "4mupc-myaaa-aaaah-qcz2a-cai",
    "hxaxw-nyaaa-aaaag-qa7va-cai",
    "2glp2-eqaaa-aaaak-aajoa-cai",
    "bapzn-kiaaa-aaaam-qaiva-cai",
    "jh76l-5iaaa-aaaam-qawgq-cai",
    "jsmzz-qaaaa-aaaag-qa6vq-cai",
    "gll5o-xyaaa-aaaag-qbcma-cai",
    "y3b7h-siaaa-aaaah-qcnwa-cai",
    "3bqt5-gyaaa-aaaah-qcvha-cai",
    "tgwaz-xyaaa-aaaah-qcura-cai",
    "7wlda-vyaaa-aaaam-qa6pa-cai",
    "oy5vn-3yaaa-aaaam-qa2yq-cai",
    "zot6w-sqaaa-aaaam-qavka-cai",
    "k5osr-jyaaa-aaaam-qaoxq-cai",
    "po6n2-uiaaa-aaaaj-qaiua-cai",
    "527xj-ziaaa-aaaah-qcz7a-cai",
    "ndnrn-yaaaa-aaaam-qaw5a-cai",
    "3j4qd-kiaaa-aaaam-qa6wa-cai",
    "i5a2q-4yaaa-aaaam-qafla-cai",
    "j7n3m-7iaaa-aaaam-qarza-cai",
    "ghjdo-iyaaa-aaaam-qa4ra-cai",
    "cx7xc-rqaaa-aaaag-qa7iq-cai",
    "6tjeq-waaaa-aaaah-qcvzq-cai",
    "2gghi-aqaaa-aaaag-qa2na-cai",
    "5qtrn-4iaaa-aaaam-qa6ca-cai",
    "buja2-4iaaa-aaaam-qa4ca-cai",
    "jxpyk-6iaaa-aaaam-qafma-cai",
    "utyn3-uiaaa-aaaam-qa7sa-cai",
    "qklen-ryaaa-aaaal-abixa-cai",
    "juovk-aqaaa-aaaam-qa5uq-cai",
    "sjybn-raaaa-aaaah-qcy2q-cai",
    "hqvh5-maaaa-aaaam-qaxfa-cai",
    "7cpyk-jyaaa-aaaag-qa5na-cai",
    "nges7-giaaa-aaaaj-qaiya-cai",
    "xumfy-nqaaa-aaaag-qbbfq-cai",
    "t2eok-gyaaa-aaaah-qclwq-cai",
    "3ifmd-wqaaa-aaaah-qckda-cai",
    "pk6rk-6aaaa-aaaae-qaazq-cai",
    "2dtsz-iyaaa-aaaam-qa6ra-cai",
    "vwc6r-4aaaa-aaaam-qaufa-cai",
    "cwu5z-wyaaa-aaaaj-qaoaq-cai",
    "l2cqd-oaaaa-aaaam-qawja-cai",
    "itud2-biaaa-aaaam-qa2pq-cai",
    "65hl5-kaaaa-aaaag-qa5jq-cai",
    "erpx2-pyaaa-aaaah-qcqsq-cai",
    "2l7rh-eiaaa-aaaah-qcvaa-cai",
    "5t24r-yqaaa-aaaaj-qauta-cai",
    "52hdt-syaaa-aaaam-qaz6q-cai",
    "437zq-dqaaa-aaaag-qa5eq-cai",
    "lxmol-ciaaa-aaaak-abpdq-cai",
    "aseks-myaaa-aaaam-qaqia-cai",
    "46sy3-aiaaa-aaaah-qczza-cai",
    "n6bj5-ryaaa-aaaan-qaaqq-cai",
    "szsrl-tqaaa-aaaag-qa4eq-cai",
    "u4zku-sqaaa-aaaag-qa4sq-cai",
    "qbc6i-daaaa-aaaah-qcywq-cai",
    "ysmud-jqaaa-aaaam-qastq-cai",
    "ri5pt-5iaaa-aaaan-qactq-cai",
    "vj752-6iaaa-aaaah-qcm6a-cai",
    "sduhj-uaaaa-aaaam-qa7hq-cai",
    "dv6u3-vqaaa-aaaah-qcdlq-cai",
    "ljt3c-tyaaa-aaaam-qa53a-cai",
    "akczk-cyaaa-aaaag-qa7ha-cai",
    "7qjpt-fiaaa-aaaag-qa5oa-cai",
    "7sfim-liaaa-aaaah-qczta-cai",
    "6eaq7-tiaaa-aaaam-qagsa-cai",
    "3a737-4aaaa-aaaam-qa6xq-cai",
    "qfmve-5qaaa-aaaam-qa7kq-cai",
    "mnu2t-cqaaa-aaaag-qbdxq-cai",
    "kojns-saaaa-aaaam-qa2aa-cai",
    "dylar-wyaaa-aaaah-qcexq-cai",
    "ircsc-oyaaa-aaaam-qajga-cai",
    "qqlej-4yaaa-aaaam-qa7ja-cai",
    "zydwz-laaaa-aaaam-qasuq-cai",
    "4ggk4-mqaaa-aaaae-qad6q-cai",
    "z6vmv-xqaaa-aaaam-qazfa-cai",
    "736xk-wqaaa-aaaam-qazta-cai",
    "4zv6l-2aaaa-aaaaj-qauua-cai",
    "ah2fs-fqaaa-aaaak-aalya-cai",
    "zejmq-rqaaa-aaaah-qcnsq-cai",
    "dhiaa-ryaaa-aaaae-qabva-cai",
    "fpimp-wyaaa-aaaam-qa3gq-cai",
    "n37cy-xaaaa-aaaag-qbdsq-cai",
    "xfjlo-yyaaa-aaaag-qa43a-cai",
    "3mttv-dqaaa-aaaah-qcn6q-cai",
    "v6wjv-3aaaa-aaaam-qa7vq-cai",
    "g5pvm-piaaa-aaaag-qa7sa-cai",
    "bm3f5-6iaaa-aaaam-qa35q-cai",
    "vsaxy-faaaa-aaaag-qa3ia-cai",
    "rr6wy-jqaaa-aaaak-aaiqa-cai",
    "unssi-hiaaa-aaaah-qcmya-cai",
    "hfswq-niaaa-aaaam-qaxgq-cai",
    "4wiph-kyaaa-aaaam-qannq-cai",
    "jd5xc-eiaaa-aaaag-qazlq-cai",
    "x6mxl-caaaa-aaaag-qa4zq-cai",
    "j3dqa-byaaa-aaaah-qcwfa-cai",
    "mrqac-vqaaa-aaaag-qbdvq-cai",
    "veq7x-4qaaa-aaaag-qa4wq-cai",
    "r75rh-rqaaa-aaaah-qctda-cai",
    "xpjz5-xiaaa-aaaag-qbbha-cai",
    "5wr56-myaaa-aaaag-qa5da-cai",
    "sobtd-xiaaa-aaaam-qay3q-cai",
    "wvujj-ryaaa-aaaag-qaxpq-cai",
    "xxp4x-uiaaa-aaaag-qa4ya-cai",
    "ce2k4-aiaaa-aaaam-qa4ka-cai",
    "deb2y-miaaa-aaaam-qa3rq-cai",
    "txr2a-fqaaa-aaaah-qcmkq-cai",
    "mfa3f-iqaaa-aaaam-qa2xa-cai",
    "pgcmq-eiaaa-aaaag-qbd5a-cai",
    "tlpww-taaaa-aaaag-qa34a-cai",
    "6gcxy-qyaaa-aaaag-qa5la-cai",
    "eb7r3-myaaa-aaaah-qcdya-cai",
    "goei2-daaaa-aaaao-aaiua-cai",
    "px5ub-qqaaa-aaaah-qcjxa-cai",
    "4dz42-aqaaa-aaaag-qba3q-cai",
    "oapqk-zyaaa-aaaam-qa5ha-cai",
    "4k2xg-wyaaa-aaaag-qba2a-cai",
    "pkasq-3iaaa-aaaam-qa5aa-cai",
    "t555s-uyaaa-aaaal-qbjsa-cai",
    "rsehi-viaaa-aaaag-qa4oa-cai",
    "pmc6d-lyaaa-aaaag-qa6ba-cai",
    "mreap-uqaaa-aaaag-qazva-cai",
    "3toq6-byaaa-aaaam-qavfq-cai",
    "kt2l3-uiaaa-aaaam-qarta-cai",
    "o3kmp-daaaa-aaaam-qa5fq-cai",
    "xphpx-xyaaa-aaaah-qcmta-cai",
    "uh4wr-iiaaa-aaaag-qa4qa-cai",
    "3kt53-zaaaa-aaaah-qczkq-cai",
    "xdlh5-iiaaa-aaaam-qa72a-cai",
    "yrdz3-2yaaa-aaaah-qcvpa-cai",
    "z7mqv-liaaa-aaaah-qcnqa-cai",
    "rln4s-bqaaa-aaaah-qcyrq-cai",
    "er7d4-6iaaa-aaaaj-qac2q-cai",
    "gikg4-eaaaa-aaaam-qaieq-cai",
    "tco7x-piaaa-aaaam-qamiq-cai",
    "jqa6g-6aaaa-aaaah-qc2iq-cai",
    "2n77z-oyaaa-aaaao-aakuq-cai",
    "jkkkb-6aaaa-aaaam-qar2q-cai",
    "gk4xe-lqaaa-aaaam-qa3na-cai",
    "5jw6a-caaaa-aaaag-qba4q-cai",
    "mytl6-dyaaa-aaaag-qbdua-cai",
    "lmgot-3qaaa-aaaag-qazha-cai",
    "p4q27-cyaaa-aaaam-qa26q-cai",
    "qjwjm-eaaaa-aaaah-qctga-cai",
    "xzxhy-oiaaa-aaaah-qclnq-cai",
    "swtwe-viaaa-aaaam-qa7ea-cai",
    "njzvb-3qaaa-aaaag-qbdrq-cai",
    "k2nwy-oaaaa-aaaag-qazca-cai",
    "s7q5y-daaaa-aaaam-qa7fq-cai",
    "5h2fc-zaaaa-aaaah-qcnjq-cai",
    "jeghr-iaaaa-aaaah-qco7q-cai",
    "xcep7-sqaaa-aaaah-qcukq-cai",
    "5movr-diaaa-aaaak-aaftq-cai",
    "2s2iy-xaaaa-aaaah-qczoq-cai",
    "cuioa-jiaaa-aaaag-qayvq-cai",
    "scxno-jiaaa-aaaag-qa4ga-cai",
    "e2ung-3qaaa-aaaam-qa46q-cai",
    "556r5-uqaaa-aaaah-qcz7q-cai",
    "7no7f-paaaa-aaaam-qa6nq-cai",
    "i2xig-xaaaa-aaaam-qa2oa-cai",
    "g73gj-kyaaa-aaaam-qa3oq-cai",
    "iohft-haaaa-aaaam-qar4q-cai",
    "5izaq-vyaaa-aaaah-qcz4a-cai",
    "5lwni-gqaaa-aaaam-qa6aq-cai",
    "2mgdj-caaaa-aaaam-qavba-cai",
    "gpjcv-dyaaa-aaaag-qa7ra-cai",
    "wpgju-2iaaa-aaaag-qa44a-cai",
    "nfvlz-jaaaa-aaaah-qcciq-cai",
    "4odun-ayaaa-aaaak-aarbq-cai",
    "hbe7u-viaaa-aaaag-qbcla-cai",
    "zhibq-piaaa-aaaah-qcvka-cai",
    "llt6y-2iaaa-aaaam-qarxa-cai",
    "poyn6-dyaaa-aaaah-qcfzq-cai",
    "ya6vf-jaaaa-aaaag-qa2aa-cai",
    "ehr7n-3yaaa-aaaam-qaiia-cai",
    "usprd-faaaa-aaaam-qauda-cai",
    "tnvo7-iaaaa-aaaah-qcy4q-cai",
    "oqais-viaaa-aaaan-qatta-cai",
    "4fcza-biaaa-aaaah-abi4q-cai",
    "bkvll-jiaaa-aaaah-qcqnq-cai",
    "v2awd-oaaaa-aaaam-qayia-cai",
    "zzk67-giaaa-aaaaj-qaujq-cai",
    "nlzgj-7aaaa-aaaam-qa5nq-cai",
    "uj63z-tyaaa-aaaag-qa4ra-cai",
    "thn6e-baaaa-aaaag-qaxra-cai",
    "m6fha-siaaa-aaaam-qa2vq-cai",
    "fryf3-eiaaa-aaaag-qa7ya-cai",
    "3rove-iiaaa-aaaam-qazjq-cai",
    "x2oiq-waaaa-aaaag-qbbeq-cai",
    "hihui-daaaa-aaaag-qbckq-cai",
    "j7znt-tiaaa-aaaag-qazjq-cai",
    "4gbxl-byaaa-aaaak-aafuq-cai",
    "6kk5l-syaaa-aaaaj-qau2q-cai",
    "qkzeu-xiaaa-aaaam-qau2q-cai",
    "zqpvh-hqaaa-aaaah-qczfq-cai",
    "7i54s-nyaaa-aaaal-abomq-cai",
    "odyji-baaaa-aaaam-qa22a-cai",
    "aguhh-4yaaa-aaaam-qa32q-cai",
    "v3x4j-siaaa-aaaag-qbbja-cai",
    "obm2n-eqaaa-aaaag-qa6gq-cai",
    "s36wu-5qaaa-aaaah-qcyzq-cai",
    "jntyp-yiaaa-aaaah-qcr3q-cai",
    "4gyjg-jyaaa-aaaam-qa6ha-cai",
    "olmi6-laaaa-aaaag-qbd2q-cai",
    "6wghg-7yaaa-aaaam-qagra-cai",
    "nwkaa-ziaaa-aaaam-qaw6q-cai",
    "bepel-uiaaa-aaaag-qbc5a-cai",
    "zvycl-fyaaa-aaaah-qckmq-cai",
    "kgjmj-zaaaa-aaaag-qazaa-cai",
    "4nvhy-3qaaa-aaaah-qcnoq-cai",
    "qgsqp-byaaa-aaaah-qbi4q-cai",
    "6z5wo-yqaaa-aaaah-qcsfa-cai",
    "flvm3-zaaaa-aaaak-qazaq-cai",
    "fcwhh-piaaa-aaaak-qazba-cai",
    "ffxbt-cqaaa-aaaak-qazbq-cai"];


  useEffect(() => {
    async function checkConnection() {
        await window.ic.plug.requestConnect({
          whitelist,
        });
        var p = await window.ic.plug.agent.getPrincipal();
        setAccAdd(p.toString());
        console.log(p.toString());
        const a = {
          owner: p,
          subaccount: [],
        }
        const actor = await window.ic.plug.createActor({
          canisterId: btc_token,
          interfaceFactory: icrc1IDL,
        });
        const b = await actor.icrc1_balance_of(a);
        const precision = 100000000n;
        const bal = Number(b * 100000000n / precision) / 100000000;
        setBTCBalance(bal);
        setConnect("Connected!");
    }
    checkConnection();
  }, []);

  const wallet_connect_plug = async (event) => {
    const isConnected = await window.ic.plug.requestConnect({
      whitelist,
    });
    var p = await window.ic.plug.agent.getPrincipal();
    setAccAdd(p.toString());
  };

  const transfer_btc = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const actor = await window.ic.plug.createActor({
      canisterId: btc_token,
      interfaceFactory: icrc1IDL,
    });

    try {
      setLoader(true)
      const _req = {
        to: {
          // owner : Principal.fromText(_to),
          owner: Principal.from(to),
          subaccount: [],
        },
        fee: [BigInt(10)],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: BigInt(amount),
      };
      const res = await actor.icrc1_transfer(_req);
      console.log(res);
      if (res.Ok == undefined) {
        alert("Transfer Failed!");
      }
      else {
        alert("Successful. Height : " + res.Ok);
      }
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
    }
  };

  const bulk_transfer_btc = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const actor = await window.ic.plug.createActor({
      canisterId: btc_token,
      interfaceFactory: icrc1IDL,
    });
    try {
      setLoader(true)
      let failed_txs = [];
      let succ_txs = [];
      let j = JSON.parse(json);
      console.log(j);
      for (let i = 0; i < j.length; i++) {
        const to = Principal.from(j[i].to);
      };
      for (let i = 0; i < j.length; i++) {
        const _to = String(j[i].to);
        const _amt = BigInt(j[i].amount);
        const _req = {
          to: {
            owner: Principal.from(_to),
            subaccount: [],
          },
          fee: [BigInt(10)],
          memo: [],
          from_subaccount: [],
          created_at_time: [],
          amount: BigInt(_amt),
        };
        const res = await actor.icrc1_transfer(_req);
        // console.log(res);
        if (res.Ok == undefined) {
          failed_txs.push(JSON.stringify(j[i]));
        }
        else {
          succ_txs.push(JSON.stringify(j[i]));
        }
      }
      console.log("Failed TXs : " + failed_txs);
      console.log("Successful TXs : " + succ_txs);
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
    }
  };


  //NFT Transfer tool

  const handleCollectionChange = async (event) => {
    setCollectionCanister(event.target.value);
    // console.log(collectionCanister)
  }
  const handlePrincipalChange = async (event) => {
    const str = event.target.value;
    setPrincipals(str.split(','));
  }

  const getUserNFTs = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const sessionData = window.ic.plug.sessionManager.sessionData;
    const f = Principal.fromText(sessionData.principalId);
    console.log(f);
    var aid = getAccountId(f, []);
    const actor = await window.ic.plug.createActor({
      canisterId: collectionCanister,
      interfaceFactory: ext721IDL,
    });
    const tokenIds = [];
    var res = await actor.getRegistry();
    for (let i = 0; i < res.length; i++) {
      if (res[i][1] == aid) {
        tokenIds.push(res[i][0]);
      }
    };
    return tokenIds;
  };

  const handleTransfer = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    setLoader(true)
    try {
      const tokenIds = await getUserNFTs();
      console.log(tokenIds);
      const to = princiapals;
      const f = await window.ic.plug.agent.getPrincipal();
      setFrom(f);

      const txs = [];
      const _res = [];
      if (tokenIds.length < to.length) {
        alert("You do not hold enoguh NFT's in this collection!");
        setLoader(false);
        return;
      }
      //checking valid checksum principals
      try {
        for (let i = 0; i < to.length; i++) {
          var p = Principal.fromText(String(to[i]));
        }
      } catch (e) {
        alert(e);
        setLoader(false);
        return;
      };
      const actor = await window.ic.plug.createActor({
        canisterId: collectionCanister,
        interfaceFactory: ext721IDL,
      });
      for (let i = 0; i < to.length; i++) {
        var tokenIdentifier = getTokenIdentifier(collectionCanister, tokenIds[i]);
        const TX = {
          idl: ext721IDL,
          canisterId: collectionCanister,
          methodName: 'transfer',
          args: [{
            to: { principal: Principal.fromText(String(to[i])) },
            from: { principal: f },
            token: tokenIdentifier,
            amount: BigInt(1),
            memo: new Array(32).fill(0),
            notify: false,
            subaccount: [],
          }],
          onSuccess: async (res) => {
            _res.push(res);
            console.log(res);
          },
          onFail: (res) => {
            console.log(res);
          },
        };
        txs.push(TX);
      }
      await window.ic.plug.batchTransactions(txs);
      console.log(_res);
      setLoader(false);
    }
    catch (err) {
      console.log(err);
      setLoader(false)
    }
    setLoader(false)
  };

  return (
    <div style={{ "fontSize": "30px" }}>
      {/* <div> */}
      <div style={{ display: "flex", justifyContent: "center", backgroundColor: "Black", position: "fixed", width: "100%" }}>
        <div style={{ marginRight: 50 }}>
          {
            loader && (<Audio
              height="30"
              width="30"
              radius="9"
              color='green'
              ariaLabel='three-dots-loading'
              wrapperStyle
              wrapperClass
            />)
          }
        </div>
        <div>
          <button
            style={{ backgroundColor: "", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
            className=""
            onClick={wallet_connect_plug}>
            Connect PLUG
          </button>
        </div>
        <div style={{ color: "Green", backgroundColor: "Yellow", fontSize: 20, height: 30, marginTop: 20, marginLeft: 30 }}>{acc_add}</div>
      </div>

      <br></br>
      <div style={{ paddingTop: 50, color: "Red" }}><b>ckBTC </b>balance :- <b>{btc_balance}</b></div>
      <br></br>
      <div>
        Transfer <b>ckBTC</b> :
        <div><input
          name="to"
          placeholder="To?"
          required
          onChange={(event) => setTo(event.target.value)}
        ></input></div>
        <div><input
          name="amt"
          placeholder="Amount?"
          required
          onChange={(event) => setAmount(event.target.value)}
        ></input></div>
        <button
          style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
          className=""
          onClick={transfer_btc}>
          Transfer!
        </button>
      </div>

      <br></br>

      <div>
        Bulk Transfer <b>ckBTC</b> :
        <div><input
          name="json"
          placeholder="JSON Data?"
          required
          onChange={(event) => setJson(event.target.value)}
        ></input></div>
        <button
          style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
          className=""
          onClick={bulk_transfer_btc}>
          Transfer!
        </button>
      </div>

      <br></br>
      <div>
        Bulk Transfer NFT's :
        <div><input
          style={{ width: 1000, height: 30 }}
          name="Collection"
          placeholder="Collection Canister ID?"
          required
          onInput={handleCollectionChange}
          value={collectionCanister}
        ></input>
        </div>
        <div><input
          style={{ width: 1000, height: 30 }}
          name="principals"
          placeholder="principal ids? (, separated values) "
          required
          onInput={handlePrincipalChange}
          value={princiapals}
        ></input>
        </div>
        <button
          style={{ backgroundColor: "black", color: "white", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 1000, height: 30 }}
          className=""
          onClick={handleTransfer}>
          Transfer
        </button>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));