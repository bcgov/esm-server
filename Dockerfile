FROM node:0.10

MAINTAINER Matthias Luebken, matthias@catalyst-zero.com

# Install gem sass for  grunt-contrib-sass
RUN apt-get update -qq && apt-get install -y build-essential
RUN apt-get install -y ruby
RUN gem install sass

WORKDIR /home/mean

# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli bower forever

# Install Mean.JS packages
ADD package.json /home/mean/package.json
ADD .bowerrc /home/mean/.bowerrc
ADD bower.json /home/mean/bower.json
RUN git config --global url."https://".insteadOf git:// && npm install

# Make everything available for start
ADD . /home/mean

RUN grunt buildprod

# Set environment  to production
ENV NODE_ENV production

# Set location where uploads files should be stored
ENV UPLOAD_PATH /uploads

# Provide a mount point for uploaded files so it can be mapped to a host filesystem location at runtime.
VOLUME /uploads

EXPOSE 3000
ENTRYPOINT ["./run.sh"]
