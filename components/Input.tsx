import React from 'react';
import {ethers} from 'ethers';
import {formatToNormalizedAmount, formatToNormalizedValue} from '@yearn-finance/web-lib/utils/format.bigNumber';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';

import type {BigNumber} from 'ethers';
import type {ReactElement} from 'react';

type 		TInput = {
	value: string,
	onChange: (s: string) => void
	onSearch?: (s: string) => void
	ariaLabel?: string
	withMax?: boolean
	onMaxClick?: () => void
} & React.ComponentPropsWithoutRef<'input'>
function	InputBase({
	value,
	onChange,
	onSearch,
	ariaLabel = 'Search',
	withMax,
	onMaxClick,
	className,
	...props
}: TInput): ReactElement {
	return (
		<form
			name={ariaLabel}
			onSubmit={(e): void => {
				e.preventDefault();
				if (onSearch) {
					onSearch(value);
				}
			}}>
			<div
				aria-label={ariaLabel}
				className={`flex h-12 w-full flex-row items-center border-2 border-grey-3 bg-grey-3 py-2 px-4 text-black transition-colors focus-within:border-black ${className}`}>
				<span className={'sr-only'}>{ariaLabel}</span>
				<input
					value={value}
					onChange={(e): void => onChange(e.target.value)}
					type={'text'}
					aria-label={props['aria-label']}
					data-np-invisible={false}
					data-np-checked={false}
					placeholder={props.placeholder}
					min={props.min}
					className={'w-full border-none bg-white/0 p-0 outline-none focus:border-none focus:outline-none focus:ring-0'} />
				{withMax ? (
					<div
						className={'ml-2 cursor-pointer'}
						onClick={(): void => onMaxClick ? onMaxClick() : undefined}>
						{'MAX'}
					</div>
				) : null}
			</div>
		</form>
	);
}


type		TInputBigNumber = {
	label?: string
	value: string,
	onSetValue: (s: string) => void,
	maxValue?: BigNumber,
	decimals?: number,
	onValueChange?: (s: string) => void,
	shouldHideBalance?: boolean
	canBeZero?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>;

function	InputBigNumber({
	label,
	value,
	onSetValue,
	maxValue = ethers.constants.Zero,
	decimals = 18,
	onValueChange,
	shouldHideBalance,
	canBeZero = false,
	...props
}: TInputBigNumber): ReactElement {
	function	onChange(s: string): void {
		performBatchedUpdates((): void => {
			onSetValue(s);
			if (onValueChange) {
				onValueChange(s);
			}
		});
	}
	return (
		<label
			aria-invalid={(
				value !== '' &&
				((!Number(value) && !canBeZero) ||
				(Number(value) > formatToNormalizedValue(maxValue, decimals)))
			)}
			className={'space-y-2'}>
			{label ? <p>{label}</p> : null}
			<Input
				value={value}
				type={'number'}
				min={0}
				onChange={(s: unknown): void => onChange(s as string)}
				onSearch={(s: unknown): void => onChange(s as string)}
				aria-label={'amountToken1'}
				placeholder={'0.00000000'}
				max={formatToNormalizedValue(maxValue, decimals)}
				onMaxClick={(): void => {
					if (!maxValue.isZero()) {
						const	valueAsString = formatToNormalizedValue(maxValue, decimals).toString();
						if (valueAsString.includes('e')) {
							return;
						}
						onChange(valueAsString);
					}
				}}
				withMax
				disabled={props.disabled} />
			{shouldHideBalance ? null : (
				<p
					className={'cursor-pointer text-xs'}
					onClick={(): void => {
						if (!maxValue.isZero()) {
							const	valueAsString = formatToNormalizedValue(maxValue, decimals).toString();
							if (valueAsString.includes('e')) {
								return;
							}
							onChange(valueAsString);
						}
					}}>
					{`Balance: ${maxValue.isZero() ? '0.000000' : formatToNormalizedAmount(maxValue, decimals)}`}
				</p>
			)}
		</label>
	);
}

const Input = Object.assign(InputBase, {BigNumber: InputBigNumber});
export default Input;
