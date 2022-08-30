import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Loader = (props) => {
  if (props.isLoading)
    return (
      <Skeleton
        width="50%"
        baseColor="#333333"
        highlightColor="#5d5d69"
        containerClassName="skeleton"
        borderRadius="0.5em"
        inline={true}
        {...props}
      />
    );
  return props.children;
};

export { Loader };
