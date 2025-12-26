export function calculateMinNodeSize({
  handleCount = 0,
  handleSpacingPercent = 12,
  handleSize = 14,
  headerHeight = 40,
  padding = 20,
  baseMinWidth = 150,
  baseMinHeight = 80,
}) {
  if (handleCount === 0) {
    return {
      minWidth: baseMinWidth,
      minHeight: baseMinHeight,
      requiredHeight: baseMinHeight,
    };
  }
  
  const contentPadding = 28;
  const messageAreaHeight = 55;
  const optionItemHeight = 42;
  const bottomSpace = 70;
  
  const contentHeight = contentPadding + messageAreaHeight + (handleCount * optionItemHeight) + bottomSpace;
  
  const requiredHeight = headerHeight + contentHeight;
  
  const firstHandlePosition = 30;
  const lastHandlePosition = firstHandlePosition + (handleCount - 1) * handleSpacingPercent;
  
  let minHeightFromPercentage = requiredHeight;
  if (lastHandlePosition < 98 && handleCount > 0) {
    const spaceBelowHandle = bottomSpace + handleSize + 20;
    
    const contentAboveLastHandle = headerHeight + contentPadding + messageAreaHeight + (handleCount * optionItemHeight);
    
    const minHeightForSpaceBelow = spaceBelowHandle / (1 - lastHandlePosition / 100);
    const minHeightForContent = contentAboveLastHandle / (lastHandlePosition / 100);
    
    minHeightFromPercentage = Math.max(minHeightForSpaceBelow, minHeightForContent);
  }
  
  const minHeight = Math.max(baseMinHeight, Math.ceil(Math.max(minHeightFromPercentage, requiredHeight)) + 40);
  
  const minWidth = Math.max(baseMinWidth, padding * 2 + handleSize * 2);
  
  return {
    minWidth: Math.ceil(minWidth),
    minHeight: minHeight,
    requiredHeight: minHeight,
  };
}

