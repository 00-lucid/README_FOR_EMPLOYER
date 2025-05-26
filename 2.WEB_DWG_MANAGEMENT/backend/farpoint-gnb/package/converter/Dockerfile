FROM mcr.microsoft.com/dotnet/sdk:3.1-focal

RUN apt-get update
RUN apt-get -y install libgl1-mesa-glx
RUN apt-get -y install software-properties-common
RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN apt-get update
RUN apt-get -y upgrade libstdc++6
RUN apt-get dist-upgrade


WORKDIR /opencloud
COPY ./ /opencloud

ENV PATH=$PATH:/opencloud/Drawings_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/IFC_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/Kernel_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/Publish_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/Visualize_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/WebTools_lnxX64_8.3dll_23.8/bin/lnxX64_8.3dll
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opencloud/Drawings_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/IFC_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/Kernel_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/Publish_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/Visualize_lnxX64_11dll_23.8/bin/lnxX64_11dll:/opencloud/WebTools_lnxX64_8.3dll_23.8/bin/lnxX64_8.3dll
