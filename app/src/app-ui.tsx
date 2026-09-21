import type { ComponentProps } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Runtime from './mobile';
export const nativePhone=document.documentElement.dataset.phone==='true';
const hide=()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();};
export const useKeyboard=nativePhone?()=>({hide}):Runtime.useKeyboard;
export const useKeyboardInsets=nativePhone?()=>({bottomInset:0}):Runtime.useKeyboardInsets;
export function KeyboardInput(props:ComponentProps<typeof Runtime.KeyboardInput>){return nativePhone?<input {...props}/>:<Runtime.KeyboardInput {...props}/>;}
export function KeyboardTextarea(props:ComponentProps<typeof Runtime.KeyboardTextarea>){return nativePhone?<textarea {...props}/>:<Runtime.KeyboardTextarea {...props}/>;}
export function MobileScroll(props:ComponentProps<typeof Runtime.MobileScroll>){return nativePhone?<div className={'native-scroll '+(props.className||'')}>{props.children}</div>:<Runtime.MobileScroll {...props}/>;}
export function BottomSheet(props:ComponentProps<typeof Runtime.BottomSheet>){if(!nativePhone)return <Runtime.BottomSheet {...props}/>;return <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}><Dialog.Portal><Dialog.Overlay className="native-overlay"/><Dialog.Content className="native-sheet" onOpenAutoFocus={e=>{e.preventDefault();hide();}}><div className="native-sheet-heading"><Dialog.Title>{props.title}</Dialog.Title><Dialog.Description>{props.description}</Dialog.Description><Dialog.Close aria-label="Close sheet">Close</Dialog.Close></div>{props.children}</Dialog.Content></Dialog.Portal></Dialog.Root>;}
