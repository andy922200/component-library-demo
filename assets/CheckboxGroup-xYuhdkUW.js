import{d as G,c as v,b as n,e as a,w as V,v as O,t as g,x as F,s as S,u as s,n as h,F as D,f as I,i as r,y as M,r as N,k as U}from"./index-DlwOqR7N.js";import{B as $}from"./index-DdTasi89.js";import"./_plugin-vue_export-helper-DlAUqK2U.js";const A={key:0,class:"base-original-checkbox__wrapper flex"},E=["id"],W=["for"],z={key:0,class:"base-original-checkbox__wrapper flex"},L=["id","onUpdate:modelValue","disabled"],T=["for"],j=G({name:"CheckboxGroup",__name:"index",props:{optionMap:{type:Object,default:()=>({id:"",data:[]})},optionStyle:{type:Object,default:()=>({bgColor:"",checkedBgColor:"",checkedBorderColor:"",defaultMarkIconColor:""})},groupWrapperClass:{type:String,default:""},fatherClass:{type:String,default:""},childrenAreaClass:{type:String,default:""},childrenClass:{type:String,default:""},isOriginalChecked:{type:Boolean,default:!1}},emits:["update:father-option-change","update:children-option-change"],setup(i,{emit:p}){const d=i,m=p,{bgColor:u,checkedBgColor:o,checkedBorderColor:f,defaultMarkIconColor:C}=d.optionStyle,e=v(()=>d.optionMap.data.filter(c=>c.isFather)),k=v(()=>d.optionMap.data.filter(c=>!c.isFather)),x=c=>{k.value.forEach(t=>{t.checked=c}),m("update:father-option-change",{checked:e.value[0].checked,options:e.value[0]})},y=()=>{e.value[0].checked=k.value.some(c=>c.checked),m("update:children-option-change",{fatherOption:e.value[0],options:k.value,checkedOptions:k.value.filter(c=>c.checked)})};return(c,t)=>{var _,w,B;return r(),n("div",{class:h(["checkbox-group__wrapper flex flex-wrap",i.groupWrapperClass])},[a("div",{class:h(["checkbox-group__father w-full",i.fatherClass])},[d.isOriginalChecked?(r(),n("div",A,[V(a("input",{id:(_=e.value[0])==null?void 0:_.value,"onUpdate:modelValue":t[0]||(t[0]=l=>e.value[0].checked=l),type:"checkbox",class:"mr-2 cursor-pointer rounded p-2 focus:outline-0 focus:ring-0 focus:ring-offset-0",onChange:t[1]||(t[1]=()=>x(e.value[0].checked))},null,40,E),[[O,e.value[0].checked]]),a("label",{for:(w=e.value[0])==null?void 0:w.value,class:"cursor-pointer"},g((B=e.value[0])==null?void 0:B.name),9,W)])):(r(),F($,{key:1,modelValue:e.value[0].checked,"onUpdate:modelValue":t[2]||(t[2]=l=>e.value[0].checked=l),"bg-color":s(u),"checked-bg-color":s(o),"checked-border-color":s(f),"default-mark-icon-color":s(C),"data-value":e.value[0].value,onChange:x},{default:S(()=>{var l;return[M(g((l=e.value[0])==null?void 0:l.name),1)]}),_:1},8,["modelValue","bg-color","checked-bg-color","checked-border-color","default-mark-icon-color","data-value"]))],2),a("div",{class:h(["checkbox-group__children-area disabled flex w-full flex-wrap",i.childrenAreaClass])},[(r(!0),n(D,null,I(k.value,l=>(r(),n("div",{key:l.id,class:h(["checkbox-group__child",i.childrenClass])},[d.isOriginalChecked?(r(),n("div",z,[V(a("input",{id:l.id,"onUpdate:modelValue":b=>l.checked=b,type:"checkbox",class:h(["mr-2 rounded p-2 focus:outline-0 focus:ring-0 focus:ring-offset-0",{"cursor-not-allowed border-[#ddd] bg-[#eee] opacity-60":!e.value[0].checked,"cursor-pointer":e.value[0].checked}]),disabled:!e.value[0].checked,onChange:y},null,42,L),[[O,l.checked]]),a("label",{for:l.id,class:h({"cursor-not-allowed opacity-60":!e.value[0].checked,"cursor-pointer":e.value[0].checked})},g(l.name),11,T)])):(r(),F($,{key:1,modelValue:l.checked,"onUpdate:modelValue":b=>l.checked=b,"bg-color":s(u),"checked-bg-color":s(o),"checked-border-color":s(f),"default-mark-icon-color":s(C),disabled:!e.value[0].checked,"data-value":l.value,onChange:y},{default:S(()=>[M(g(l.name),1)]),_:2},1032,["modelValue","onUpdate:modelValue","bg-color","checked-bg-color","checked-border-color","default-mark-icon-color","disabled","data-value"]))],2))),128))],2)],2)}}}),q={class:"w-full"},H={class:"flex items-center justify-center"},J={class:"m-2"},K={class:"m-2"},P={class:"my-1 flex justify-center"},Y=G({name:"DemoCheckboxGroup",__name:"CheckboxGroup",setup(i){const p=N({id:"group1",data:[{id:"father1",name:"Father",isFather:!0,checked:!1,value:"father1"},{id:"child1",name:"Child 1",isFather:!1,checked:!1,value:"child1"},{id:"child2",name:"Child 2",isFather:!1,checked:!1,value:"child2"},{id:"child3",name:"Child 3",isFather:!1,checked:!1,value:"child3"}]}),d={bgColor:"#ffffff",checkedBgColor:"#ffffff",checkedBorderColor:"#16a34a",defaultMarkIconColor:"#16a34a"},m=v(()=>p.value.data.filter(u=>u.checked&&!u.isFather));return(u,o)=>(r(),n("div",q,[o[3]||(o[3]=a("h1",{class:"text-center text-lg"},"CheckboxGroup 核取方塊群",-1)),a("div",H,[a("div",J,[o[0]||(o[0]=a("h2",{class:"my-2"},"原生 Checkbox",-1)),U(j,{"option-map":p.value,"option-style":d,"group-wrapper-class":"lg:items-center","father-class":"mb-2 lg:mb-0 lg:mr-4 lg:w-[12rem] lg:break-all","children-area-class":"px-4 py-2 border border-[#cccccc] rounded lg:w-[calc(100%-13rem)] lg:bg-[#d9d9d94d]","children-class":"my-1 mr-4","is-original-checked":!0},null,8,["option-map"])]),a("div",K,[o[1]||(o[1]=a("h2",{class:"my-2"},"客製化 Checkbox",-1)),U(j,{"option-map":p.value,"option-style":d,"group-wrapper-class":"lg:items-center","father-class":"mb-2 lg:mb-0 lg:mr-4 lg:w-[12rem] lg:break-all","children-area-class":"px-4 py-2 border border-[#cccccc] rounded lg:w-[calc(100%-13rem)] lg:bg-[#d9d9d94d]","children-class":"my-1 mr-4"},null,8,["option-map"])])]),a("div",P,[o[2]||(o[2]=a("p",null,"Selected 選擇:",-1)),a("ul",null,[(r(!0),n(D,null,I(m.value,f=>(r(),n("li",{key:f.id},g(f.name),1))),128))])])]))}});export{Y as default};
