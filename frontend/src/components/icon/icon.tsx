import type { JSX } from "preact";
import {
    CaretDownIcon,
    CaretLeftIcon,
    CaretRightIcon,
    CheckCircleIcon,
    EnvelopeIcon,
    FloppyDiskIcon,
    InfoIcon,
    LockIcon,
    MagnifyingGlassIcon,
    PencilSimpleIcon,
    PlusIcon,
    StarIcon,
    TrashIcon,
    UserCircleIcon,
    WarningCircleIcon,
    XIcon,
} from "@phosphor-icons/react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import { IconName } from "@shared/enums/icon.enums";
import type { IconProps } from "@/components/icon/icon.types";

type PhosphorIconComponent = (props: PhosphorIconProps) => JSX.Element;

const phosphorMap: Partial<Record<IconName, PhosphorIconComponent>> = {
    [IconName.SEARCH]: (props) => <MagnifyingGlassIcon {...props} />,
    [IconName.USER]: (props) => <UserCircleIcon {...props} />,
    [IconName.EMAIL]: (props) => <EnvelopeIcon {...props} />,
    [IconName.LOCK]: (props) => <LockIcon {...props} />,
    [IconName.CLOSE]: (props) => <XIcon {...props} />,
    [IconName.CHECK]: (props) => <CheckCircleIcon {...props} />,
    [IconName.WARNING]: (props) => <WarningCircleIcon {...props} />,
    [IconName.INFO]: (props) => <InfoIcon {...props} />,
    [IconName.STAR]: (props) => <StarIcon {...props} />,
    [IconName.DELETE]: (props) => <TrashIcon {...props} />,
    [IconName.ADD]: (props) => <PlusIcon {...props} />,
    [IconName.EDIT]: (props) => <PencilSimpleIcon {...props} />,
    [IconName.SAVE]: (props) => <FloppyDiskIcon {...props} />,
    [IconName.CHEVRON_DOWN]: (props) => <CaretDownIcon {...props} />,
    [IconName.CHEVRON_LEFT]: (props) => <CaretLeftIcon {...props} />,
    [IconName.CHEVRON_RIGHT]: (props) => <CaretRightIcon {...props} />,
};

/**
 * @summary Renders a semantic icon mapped to the Phosphor icon set.
 */
export function Icon({ name, size = 18, weight, mirrored = false }: IconProps): JSX.Element | null {
    const IconComponent = phosphorMap[name];

    if (!IconComponent) {
        return null;
    }

    return (
        <IconComponent
            size={size}
            weight={weight}
            mirrored={mirrored}
            aria-hidden="true"
        />
    );
}