//XXX: currently unused

export function handleError(err) {
  console.log('Error Message:', error.message);

  // Print the stack trace line by line
  if (error.stack) {
    console.log('Stack Trace:');
    const stackLines = error.stack.split('\n');
    stackLines.forEach(line => {
      console.log(line.trim());
    });
  } else {
    console.log('No stack trace available');
  }

  hmUI.showToast({
    text: "oops we did a fucky wucky! :3"
  })
}

export default function protect(cb) {
  try {
    return cb();
  } catch(err) {
    handleError(err);
  }
}
